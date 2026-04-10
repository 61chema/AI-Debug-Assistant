import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.schemas import DebugRequest
from app.models.db_models import Conversation, Message
from app.services.claude_service import stream_debug
from app.utils.rate_limiter import rate_limit

router = APIRouter()


@router.post("/debug")
async def debug_code(req: DebugRequest, db: AsyncSession = Depends(get_db), _: None = Depends(rate_limit)):
    """
    Analyze an error + code and provide debugging guidance.
    Returns a streaming SSE response.
    """

    async def generate():
        full_response = ""

        async for chunk in stream_debug(
            req.error_message, req.code, req.language, req.level, req.response_language
        ):
            if chunk.startswith("event: text"):
                # Unescape \\n back to real newlines before storing in DB
                text_data = chunk.split("data: ", 1)[1].strip().replace("\\n", "\n")
                full_response += text_data
            yield chunk

        await _save_debug_conversation(db, req, full_response)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


async def _save_debug_conversation(
    db: AsyncSession, req: DebugRequest, assistant_response: str
):
    first_line = req.error_message.strip().split("\n")[0][:80]
    title = f"Debug: {first_line}"

    conversation = Conversation(
        feature="debug",
        title=title,
        level=req.level,
    )
    db.add(conversation)
    await db.flush()

    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=(
            f"**Error:**\n```\n{req.error_message}\n```\n\n"
            f"**Code:**\n```{req.language}\n{req.code}\n```"
        ),
    )
    db.add(user_msg)

    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=assistant_response,
    )
    db.add(assistant_msg)
    await db.commit()
