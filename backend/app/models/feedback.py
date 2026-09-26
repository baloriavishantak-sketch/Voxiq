"""Evidence-Anchored Feedback Items Model."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class FeedbackItem(Base):
    """Every feedback recommendation is strictly linked to acoustic or linguistic evidence
    and exact timestamps.
    """
    __tablename__ = "feedback_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), index=True)
    
    category: Mapped[str] = mapped_column(String(50))  # pacing, hesitation, clarity, structure, vocabulary
    message: Mapped[str] = mapped_column(Text)
    evidence_quote: Mapped[str] = mapped_column(Text, nullable=True)
    evidence_start: Mapped[float] = mapped_column(Float, nullable=True)
    evidence_end: Mapped[float] = mapped_column(Float, nullable=True)
    suggestion: Mapped[str] = mapped_column(Text, nullable=True)
    severity: Mapped[str] = mapped_column(String(20), default="info")  # info, positive, caution

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    session = relationship("SessionModel", back_populates="feedback_items")
