import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.schemas import ExplainRequest
from app.models.db_models import Conversation, Message
from app.services.claude_service import stream_explain
from app.utils.rate_limiter import rate_limit

router = APIRouter()


@router.post("/explain")
async def explain_code(req: ExplainRequest, db: AsyncSession = Depends(get_db), _: None = Depends(rate_limit)):
    """
    Explain a block of code at the chosen experience level.
    Returns a streaming SSE response.
    """

    async def generate():
        full_response = ""
        annotations = []

        async for chunk in stream_explain(req.code, req.language, req.level, req.response_language):
            # Collect the full response for saving to the database
            if chunk.startswith("event: text"):
                # Unescape \\n back to real newlines before storing in DB
                text_data = chunk.split("data: ", 1)[1].strip().replace("\\n", "\n")
                full_response += text_data
            elif chunk.startswith("event: annotations"):
                ann_data = chunk.split("data: ", 1)[1].strip()
                try:
                    annotations = json.loads(ann_data)
                except json.JSONDecodeError:
                    pass

            yield chunk

        # Save the conversation to the database after streaming is done
        await _save_conversation(
            db, req, full_response, annotations
        )

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disables nginx buffering (important for SSE)
            "Access-Control-Allow-Origin": "*",
        },
    )


async def _save_conversation(
    db: AsyncSession,
    req: ExplainRequest,
    assistant_response: str,
    annotations: list,
):
    """Save or update the conversation in the database."""
    # Create a short title from the first line of the code
    first_line = req.code.strip().split("\n")[0][:80]
    title = f"Explain: {first_line}" if first_line else "Code explanation"

    if req.conversation_id:
        # Add to existing conversation
        conversation_id = req.conversation_id
    else:
        # Create a new conversation
        conversation = Conversation(
            feature="explain",
            title=title,
            level=req.level,
        )
        db.add(conversation)
        await db.flush()
        conversation_id = conversation.id

        # Save the user's code as the first message
        user_msg = Message(
            conversation_id=conversation_id,
            role="user",
            content=f"```{req.language}\n{req.code}\n```",
        )
        db.add(user_msg)

    # Save Claude's response
    metadata = {"annotations": annotations} if annotations else None
    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=assistant_response,
        metadata_json=json.dumps(metadata) if metadata else None,
    )
    db.add(assistant_msg)
    await db.commit()
