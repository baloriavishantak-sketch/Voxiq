"""Pydantic schemas for Communication Metrics and Timelines."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class MetricValue(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    metric_name: str
    metric_value: float
    window_start: Optional[float] = None
    window_end: Optional[float] = None
    calculation_version: str = "1.0.0"
    metadata: Optional[Dict[str, Any]] = None


class SummaryMetricsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: str
    duration_seconds: float
    speech_duration_seconds: float
    wpm: float = Field(description="Words per minute based on active speech duration")
    filler_count: int = Field(description="Total count of recognized filler words")
    filler_density: float = Field(description="Filler words divided by total words (percentage)")
    pause_count: int = Field(description="Number of detected acoustic pauses exceeding threshold")
    long_pause_count: int = Field(description="Number of pauses exceeding long threshold (1.2s)")
    average_pause_seconds: float = Field(description="Average duration of pauses")
    repetition_rate: float = Field(description="Lexical n-gram repetition rate percentage")
    type_token_ratio: float = Field(description="Vocabulary diversity measure (unique tokens / total tokens)")
    sentence_count: int = Field(description="Number of parsed linguistic sentences")
    avg_sentence_length_words: float = Field(description="Mean words per sentence")
    semantic_coherence_avg: float | None = Field(
    default=None,
    description="Mean cosine similarity across contiguous statements"
)


class TimelineWindowPoint(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    window_index: int
    window_start: float
    window_end: float
    wpm: float
    word_count: int
    filler_count: int
    pause_count: int
    pause_duration: float
    coherence_score: float
    transcript_snippet: str
    


class TimelineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: str
    window_size_seconds: float
    step_size_seconds: float
    windows: List[TimelineWindowPoint]
