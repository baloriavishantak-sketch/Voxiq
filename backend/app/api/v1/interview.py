"""Interview Mode Endpoints.

Provides preset question listings, arbitrary question decomposition via QuestionAnalyzer,
and multi-tier evidence-anchored interview response evaluation.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.database import get_db
from backend.app.models.session import SessionModel
from backend.app.models.transcript import TranscriptSegment
from backend.app.models.metric import CommunicationMetric
from backend.app.schemas.interview import (
    InterviewQuestionResponse,
    InterviewEvaluationResponse,
    InterviewEvaluationRequest,
    QuestionAnalysisRequest,
    QuestionAnalysisResponse,
    ConceptCoverageItem,
)
from backend.app.core.reasoning.rubrics import (
    DEFAULT_INTERVIEW_QUESTIONS,
    get_interview_question_by_id,
    register_custom_question,
)
from backend.app.core.reasoning.question_analyzer import QuestionAnalyzer
from backend.app.core.reasoning.recommendation import evaluate_interview_response
from backend.app.utils.logger import logger

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
            expected_points=q.get("expected_points", []),
            question_type=q.get("question_type"),
            major_concepts=q.get("major_concepts", []),
            is_custom=False
        )
        for q in DEFAULT_INTERVIEW_QUESTIONS
    ]


@router.post("/analyze-question", response_model=QuestionAnalysisResponse)
async def analyze_interview_question(payload: QuestionAnalysisRequest):
    """Analyzes an arbitrary interview question locally.
    
    Extracts question archetype, KeyBERT-style concepts via all-MiniLM-L6-v2,
    and synthesizes dynamic rubric criteria and expected answer areas.
    """
    try:
        analyzed = QuestionAnalyzer.analyze_question(
            question_text=payload.prompt,
            category_hint=payload.category
        )
        register_custom_question(analyzed)
        return QuestionAnalysisResponse(**analyzed)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Failed to analyze arbitrary question: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Question analysis failed: {str(e)}"
        )


@router.post("/evaluate", response_model=InterviewEvaluationResponse)
async def evaluate_interview(
    payload: InterviewEvaluationRequest,
    db: AsyncSession = Depends(get_db)
):
    """Evaluates a completed session against a specific preset or dynamically analyzed question."""
    session_id = payload.session_id
    session_res = await db.execute(select(SessionModel).where(SessionModel.id == session_id))
    session = session_res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")

    custom_dict = payload.custom_question.model_dump() if payload.custom_question else None
    target_qid = payload.question_id

    # If question_id given, check if known
    if target_qid:
        known_question = get_interview_question_by_id(target_qid)
        if not known_question and not custom_dict:
            raise HTTPException(status_code=404, detail=f"Question '{target_qid}' not found.")

    if not target_qid and not custom_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'question_id' or 'custom_question' must be provided for evaluation."
        )

    # Get transcript segments
    trans_res = await db.execute(
        select(TranscriptSegment)
        .where(TranscriptSegment.session_id == session_id)
        .order_by(TranscriptSegment.start_time)
    )
    segments = trans_res.scalars().all()
    sentences = [s.text for s in segments if s.text and s.text.strip()]
    full_text = " ".join(sentences)

    # Get metrics
    m_res = await db.execute(
        select(CommunicationMetric)
        .where(CommunicationMetric.session_id == session_id, CommunicationMetric.window_start == None)
    )
    metrics_map = {m.metric_name: m.metric_value for m in m_res.scalars().all()}

    try:
        eval_result = evaluate_interview_response(
            question_id=target_qid,
            answer_text=full_text,
            answer_sentences=sentences,
            metrics_summary=metrics_map,
            custom_question=custom_dict
        )
    except Exception as e:
        logger.error(f"Error evaluating interview response: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evaluation failed: {str(e)}"
        )

    # Convert concept coverage items to Pydantic models
    concept_coverage_models = [
        ConceptCoverageItem(**item) for item in eval_result.get("concept_coverage", [])
    ]

    return InterviewEvaluationResponse(
        session_id=session_id,
        question_id=eval_result["question_id"],
        relevance_score=eval_result["relevance_score"],
        completeness_score=eval_result["completeness_score"],
        structure_score=eval_result["structure_score"],
        criteria=eval_result["criteria"],
        summary_feedback=eval_result["summary_feedback"],
        question_type=eval_result.get("question_type"),
        major_concepts=eval_result.get("major_concepts", []),
        concept_coverage=concept_coverage_models,
        communication_metrics=eval_result.get("communication_metrics"),
        structure_breakdown=eval_result.get("structure_breakdown"),
        has_ground_truth=eval_result.get("has_ground_truth", False),
        technical_correctness_status=eval_result.get("technical_correctness_status", "unverified"),
        technical_correctness_disclaimer=eval_result.get("technical_correctness_disclaimer", "")
    )
