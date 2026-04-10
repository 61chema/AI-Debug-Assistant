import json
from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.db_models import Conversation, Message
from app.services.claude_service import stream_analyze
from app.services.file_service import extract_file_content
from app.utils.rate_limiter import rate_limit

router = APIRouter()


@router.post("/analyze")
async def analyze_file(
    file: UploadFile = File(...),
    level: str = Form(default="junior"),
    response_language: str = Form(default="en"),
    db: AsyncSession = Depends(get_db),
    _: None = Depends(rate_limit),
):
    file_content, filename = await extract_file_content(file)

    async def generate():
        full_response = ""

        async for chunk in stream_analyze(file_content, filename, level, response_language):
            if chunk.startswith("event: text"):
                # Unescape \\n back to real newlines before storing in DB
                text_data = chunk.split("data: ", 1)[1].strip().replace("\\n", "\n")
                full_response += text_data
            yield chunk

        await _save_analyze_conversation(db, filename, file_content, level, full_response)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


async def _save_analyze_conversation(
    db: AsyncSession,
    filename: str,
    file_content: str,
    level: str,
    assistant_response: str,
):
    conversation = Conversation(
        feature="analyze",
        title=f"Analyze: {filename}",
        level=level,
    )
    db.add(conversation)
    await db.flush()

    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=f"Analyze file: **{filename}**\n\n```\n{file_content[:500]}...\n```",
    )
    db.add(user_msg)

    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=assistant_response,
    )
    db.add(assistant_msg)
    await db.commit()
