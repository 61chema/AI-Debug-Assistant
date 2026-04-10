from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime

# ------------------------------------------------------------------
# Shared types
# ------------------------------------------------------------------

Level = Literal["junior", "mid", "senior"]
Feature = Literal["explain", "debug", "analyze", "github"]
ResponseLanguage = Literal["es", "en"]


# ------------------------------------------------------------------
# Request schemas (what the frontend sends to the backend)
# ------------------------------------------------------------------

class ExplainRequest(BaseModel):
    code: str = Field(..., min_length=1)
    language: str = Field(default="auto")
    level: Level = Field(default="junior")
    response_language: ResponseLanguage = Field(default="en")
    conversation_id: Optional[str] = None


class DebugRequest(BaseModel):
    error_message: str = Field(..., min_length=1)
    code: str = Field(..., min_length=1)
    language: str = Field(default="auto")
    level: Level = Field(default="junior")
    response_language: ResponseLanguage = Field(default="en")
    conversation_id: Optional[str] = None


class GithubRequest(BaseModel):
    url: str = Field(..., description="GitHub file or repo URL")
    analysis_type: Literal["file", "repo_overview"] = Field(default="file")
    level: Level = Field(default="junior")
    response_language: ResponseLanguage = Field(default="en")
    conversation_id: Optional[str] = None


class AnalyzeRequest(BaseModel):
    level: Level = Field(default="junior")
    response_language: ResponseLanguage = Field(default="en")


class FollowUpRequest(BaseModel):
    conversation_id: str
    message: str = Field(..., min_length=1)
    level: Level = Field(default="junior")
    response_language: ResponseLanguage = Field(default="en")


# ------------------------------------------------------------------
# Response schemas (what the backend sends back)
# ------------------------------------------------------------------

class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationSummary(BaseModel):
    id: str
    feature: str
    title: str
    level: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationDetail(ConversationSummary):
    messages: list[MessageOut]


class HealthResponse(BaseModel):
    status: str
    model: str
    db_connected: bool
