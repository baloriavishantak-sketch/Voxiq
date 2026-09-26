"""Pydantic schemas for Evidence-Anchored Feedback."""

from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class FeedbackItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    category: str  # pacing, hesitation, clarity, structure, vocabulary
    message: str
    evidence_quote: Optional[str] = None
    evidence_start: Optional[float] = None
    evidence_end: Optional[float] = None
    suggestion: Optional[str] = None
    severity: str = "info"  # info, positive, caution


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: str
    overall_summary: str
    items: List[FeedbackItemResponse]
