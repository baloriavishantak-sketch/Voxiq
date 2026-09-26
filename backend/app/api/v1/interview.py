"""Interview Mode Endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.database import get_db
from backend.app.models.session import SessionModel
from backend.app.models.transcript import TranscriptSegment
from backend.app.models.metric import CommunicationMetric
from backend.app.schemas.interview import InterviewQuestionResponse, InterviewEvaluationResponse
from backend.app.core.reasoning.rubrics import DEFAULT_INTERVIEW_QUESTIONS, get_interview_question_by_id
from backend.app.core.reasoning.recommendation import evaluate_interview_response

router = APIRouter(prefix="/interview", tags=["Interview"])


@router.get("/questions", response_model=List[InterviewQuestionResponse])
async def list_interview_questions():
    """Lists available technical and behavioral interview questions with expected points."""
    return [
        InterviewQuestionResponse(
            id=q["id"],
            category=q["category"],
            title=q["title"],
            prompt=q["prompt"],
            difficulty=q["difficulty"],
            expected_points=q.get("expected_points", [])
        )
        for q in DEFAULT_INTERVIEW_QUESTIONS
    ]


@router.post("/evaluate", response_model=InterviewEvaluationResponse)
async def evaluate_interview(
    session_id: str = Body(...),
    question_id: str = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """Evaluates a completed session against a specific interview question rubric."""
    session_res = await db.execute(select(SessionModel).where(SessionModel.id == session_id))
    session = session_res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")

    question = get_interview_question_by_id(question_id)
    if not question:
        raise HTTPException(status_code=404, detail=f"Question '{question_id}' not found.")

    # Get transcript segments
    trans_res = await db.execute(
        select(TranscriptSegment)
        .where(TranscriptSegment.session_id == session_id)
        .order_by(TranscriptSegment.start_time)
    )
    segments = trans_res.scalars().all()
    sentences = [s.text for s in segments if s.text.strip()]
    full_text = " ".join(sentences)

    # Get metrics
    m_res = await db.execute(
        select(CommunicationMetric)
        .where(CommunicationMetric.session_id == session_id, CommunicationMetric.window_start == None)
    )
    metrics_map = {m.metric_name: m.metric_value for m in m_res.scalars().all()}

    eval_result = evaluate_interview_response(
        question_id=question_id,
        answer_text=full_text,
        answer_sentences=sentences,
        metrics_summary=metrics_map
    )

    return InterviewEvaluationResponse(
        session_id=session_id,
        question_id=question_id,
        relevance_score=eval_result["relevance_score"],
        completeness_score=eval_result["completeness_score"],
        structure_score=eval_result["structure_score"],
        criteria=eval_result["criteria"],
        summary_feedback=eval_result["summary_feedback"]
    )
