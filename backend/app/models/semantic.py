"""Semantic Segments and Topic Transitions Database Models."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class SemanticSegment(Base):
    __tablename__ = "semantic_segments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), index=True)
    segment_index: Mapped[int] = mapped_column(Integer, default=0)
    text: Mapped[str] = mapped_column(Text)
    coherence_score: Mapped[float] = mapped_column(Float, default=1.0)
    topic_label: Mapped[str] = mapped_column(String(100), nullable=True)
    start_time: Mapped[float] = mapped_column(Float, default=0.0)
    end_time: Mapped[float] = mapped_column(Float, default=0.0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    session = relationship("SessionModel", back_populates="semantic_segments")


class TopicTransition(Base):
    __tablename__ = "topic_transitions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), index=True)
    timestamp: Mapped[float] = mapped_column(Float, index=True)
    from_topic: Mapped[str] = mapped_column(String(255), default="Previous Topic")
    to_topic: Mapped[str] = mapped_column(String(255), default="Next Topic")
    drift_score: Mapped[float] = mapped_column(Float, default=0.0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    session = relationship("SessionModel", back_populates="topic_transitions")
