"""Pydantic schemas for Session management."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class SessionBase(BaseModel):
    title: str = Field(default="Untitled Session", max_length=255)
    mode: str = Field(default="practice", description="practice, interview, or conversation")


class SessionCreate(SessionBase):
    pass


class SessionUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    duration_seconds: Optional[float] = None
    speech_duration_seconds: Optional[float] = None
    error_message: Optional[str] = None


class AudioAssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    original_filename: str
    file_size_bytes: int
    sample_rate: int
    duration_seconds: float
    format: str
    created_at: datetime


class SessionResponse(SessionBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: str
    duration_seconds: float
    speech_duration_seconds: float
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
