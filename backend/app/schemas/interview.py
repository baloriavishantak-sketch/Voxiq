"""Pydantic schemas for Interview Mode."""

from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class InterviewQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    category: str
    title: str
    prompt: str
    difficulty: str
    expected_points: List[str] = []


class RubricCriterionEvaluation(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    criterion: str
    score: float
    evidence: str
    feedback: str


class InterviewEvaluationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: str
    question_id: str
    relevance_score: float
    completeness_score: float
    structure_score: float
    criteria: List[RubricCriterionEvaluation]
    summary_feedback: str
