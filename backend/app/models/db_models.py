import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Conversation(Base):
    """Stores a conversation session (e.g., one explain or debug request)."""
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    # Feature type: "explain", "debug", "analyze", "github"
    feature: Mapped[str] = mapped_column(String(20), nullable=False)
    # Short title shown in the history sidebar
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    # Level selected by the user: "junior", "mid", "senior"
    level: Mapped[str] = mapped_column(String(10), nullable=False, default="junior")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    # One conversation has many messages
    messages: Mapped[list["Message"]] = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan"
    )


class Message(Base):
    """A single message inside a conversation (either user or assistant)."""
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    conversation_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("conversations.id"), nullable=False
    )
    # "user" or "assistant"
    role: Mapped[str] = mapped_column(String(10), nullable=False)
    # The actual text content
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # Optional JSON metadata (e.g., annotations, token counts)
    metadata_json: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    conversation: Mapped["Conversation"] = relationship(
        "Conversation", back_populates="messages"
    )
