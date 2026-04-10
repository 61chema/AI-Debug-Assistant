from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.database import get_db
from app.models.db_models import Conversation, Message
from app.models.schemas import ConversationSummary, ConversationDetail, MessageOut

router = APIRouter()


@router.get("/history", response_model=dict)
async def list_conversations(
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """Return a paginated list of past conversations."""
    offset = (page - 1) * limit

    # Count total conversations
    count_result = await db.execute(select(func.count(Conversation.id)))
    total = count_result.scalar()

    # Fetch conversations ordered by most recent first
    result = await db.execute(
        select(Conversation)
        .order_by(desc(Conversation.updated_at))
        .offset(offset)
        .limit(limit)
    )
    conversations = result.scalars().all()

    return {
        "items": [ConversationSummary.model_validate(c) for c in conversations],
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.get("/history/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: str, db: AsyncSession = Depends(get_db)
):
    """Return a single conversation with all its messages."""
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    # Load messages
    messages_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    conversation.messages = messages_result.scalars().all()

    return ConversationDetail.model_validate(conversation)


@router.delete("/history/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: str, db: AsyncSession = Depends(get_db)
):
    """Delete a conversation and all its messages."""
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    await db.delete(conversation)
    await db.commit()
