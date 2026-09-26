"""Session and Audio Asset Database Models."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class SessionModel(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    title: Mapped[str] = mapped_column(String(255), default="Untitled Session")
    mode: Mapped[str] = mapped_column(String(50), default="practice")  # practice, interview, conversation
    status: Mapped[str] = mapped_column(String(50), default="created")  # created, processing, completed, failed
    duration_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    speech_duration_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    error_message: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    audio_assets = relationship("AudioAsset", back_populates="session", cascade="all, delete-orphan")
    transcript_segments = relationship("TranscriptSegment", back_populates="session", cascade="all, delete-orphan", order_by="TranscriptSegment.start_time")
    metrics = relationship("CommunicationMetric", back_populates="session", cascade="all, delete-orphan")
    feedback_items = relationship("FeedbackItem", back_populates="session", cascade="all, delete-orphan")
    semantic_segments = relationship("SemanticSegment", back_populates="session", cascade="all, delete-orphan")
    topic_transitions = relationship("TopicTransition", back_populates="session", cascade="all, delete-orphan")


class AudioAsset(Base):
    __tablename__ = "audio_assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), index=True)
    file_path: Mapped[str] = mapped_column(String(500))
    original_filename: Mapped[str] = mapped_column(String(255))
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    sample_rate: Mapped[int] = mapped_column(Integer, default=16000)
    channels: Mapped[int] = mapped_column(Integer, default=1)
    duration_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    format: Mapped[str] = mapped_column(String(20), default="wav")
    is_purged: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    session = relationship("SessionModel", back_populates="audio_assets")
