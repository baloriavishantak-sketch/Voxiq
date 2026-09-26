"""Pydantic schemas for Transcripts and Words."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class WordTokenResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    word: str
    start_time: float
    end_time: float
    confidence: float
    is_filler: bool


class TranscriptSegmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    segment_index: int
    text: str
    start_time: float
    end_time: float
    confidence: float
    speaker_id: str
    words: List[WordTokenResponse] = []


class FullTranscriptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: str
    full_text: str
    segments: List[TranscriptSegmentResponse] = []
