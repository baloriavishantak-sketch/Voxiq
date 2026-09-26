"""Evidence-Anchored Feedback Endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.database import get_db
from backend.app.models.feedback import FeedbackItem
from backend.app.schemas.feedback import FeedbackResponse, FeedbackItemResponse

router = APIRouter(prefix="/sessions", tags=["Feedback"])


@router.get("/{session_id}/feedback", response_model=FeedbackResponse)
async def get_session_feedback(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieves evidence-backed communication feedback recommendations."""
    res = await db.execute(
        select(FeedbackItem).where(FeedbackItem.session_id == session_id).order_by(FeedbackItem.created_at)
    )
    items = res.scalars().all()

    if not items:
        return FeedbackResponse(
            session_id=session_id,
            overall_summary="No feedback items generated for this session yet. Please run analysis first.",
            items=[]
        )

    item_responses = [FeedbackItemResponse.model_validate(item) for item in items]
    overall_summary = f"Generated {len(item_responses)} evidence-backed recommendations across pacing, hesitation, and clarity."

    return FeedbackResponse(
        session_id=session_id,
        overall_summary=overall_summary,
        items=item_responses
    )
