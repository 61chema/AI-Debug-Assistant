from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.schemas import GithubRequest
from app.models.db_models import Conversation, Message
from app.services.claude_service import stream_github
from app.services.github_service import fetch_github_file
from app.utils.rate_limiter import rate_limit

router = APIRouter()


@router.post("/github")
async def analyze_github(req: GithubRequest, db: AsyncSession = Depends(get_db), _: None = Depends(rate_limit)):
    """
    Fetch a file from GitHub and analyze it with Claude.
    Returns a streaming SSE response.
    """
    # First fetch the file content from GitHub
    file_content, filename = await fetch_github_file(req.url)

    async def generate():
        full_response = ""

        async for chunk in stream_github(file_content, req.url, req.level, req.response_language):
            if chunk.startswith("event: text"):
                # Unescape \\n back to real newlines before storing in DB
                text_data = chunk.split("data: ", 1)[1].strip().replace("\\n", "\n")
                full_response += text_data
            yield chunk

        await _save_github_conversation(db, req, filename, file_content, full_response)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


async def _save_github_conversation(
    db: AsyncSession,
    req: GithubRequest,
    filename: str,
    file_content: str,
    assistant_response: str,
):
    conversation = Conversation(
        feature="github",
        title=f"GitHub: {filename}",
        level=req.level,
    )
    db.add(conversation)
    await db.flush()

    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=f"Analyze GitHub file: {req.url}",
    )
    db.add(user_msg)

    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=assistant_response,
    )
    db.add(assistant_msg)
    await db.commit()
