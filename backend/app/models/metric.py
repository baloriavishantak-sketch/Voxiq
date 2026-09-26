"""Versioned and Windowed Communication Metrics Database Model."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class CommunicationMetric(Base):
    """Stores both global session-level and temporal window-level metrics.
    
    Includes calculation versioning for historical reproducibility.
    """
    __tablename__ = "communication_metrics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), index=True)
    
    metric_name: Mapped[str] = mapped_column(String(100), index=True)
    metric_value: Mapped[float] = mapped_column(Float)
    
    # Nullable for session-wide aggregated metrics; specified for temporal window slices
    window_start: Mapped[float] = mapped_column(Float, nullable=True, index=True)
    window_end: Mapped[float] = mapped_column(Float, nullable=True, index=True)
    window_index: Mapped[int] = mapped_column(Integer, nullable=True)
    
    calculation_version: Mapped[str] = mapped_column(String(20), default="1.0.0")
    metadata_json: Mapped[str] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    session = relationship("SessionModel", back_populates="metrics")
