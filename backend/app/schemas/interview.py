"""Pydantic schemas for Interview Mode."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class InterviewQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    category: str
    title: str
    prompt: str
    difficulty: str
    expected_points: List[str] = []
    question_type: Optional[str] = None
    major_concepts: List[str] = []
    is_custom: bool = False


class RubricCriterionEvaluation(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    criterion: str
    score: float
    evidence: str
    feedback: str


class ConceptCoverageItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    concept: str
    coverage_score: float
    is_covered: bool
    evidence_sentence: Optional[str] = None


class QuestionAnalysisRequest(BaseModel):
    prompt: str = Field(..., min_length=5, description="Technical or behavioral interview question text")
    category: Optional[str] = Field(None, description="Optional category or domain hint")


class QuestionAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    is_custom: bool = True
    title: str
    prompt: str
    category: str
    difficulty: str
    question_type: str
    question_type_label: str
    classification_method: str
    classification_confidence: float
    major_concepts: List[str]
    expected_points: List[str]
    rubric_criteria: List[Dict[str, Any]]
    has_ground_truth: bool = False
    technical_correctness_status: str = "unverified"
    technical_correctness_disclaimer: str


class CustomQuestionInput(BaseModel):
    prompt: str
    category: Optional[str] = None
    title: Optional[str] = None
    difficulty: Optional[str] = "intermediate"
    question_type: Optional[str] = None
    major_concepts: Optional[List[str]] = None
    expected_points: Optional[List[str]] = None
    rubric_criteria: Optional[List[Dict[str, Any]]] = None


class InterviewEvaluationRequest(BaseModel):
    session_id: str
    question_id: Optional[str] = None
    custom_question: Optional[CustomQuestionInput] = None


class InterviewEvaluationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: str
    question_id: str
    relevance_score: float
    completeness_score: float
    structure_score: float
    criteria: List[RubricCriterionEvaluation]
    summary_feedback: str

    # Extended multi-tier analysis fields
    question_type: Optional[str] = None
    major_concepts: List[str] = []
    concept_coverage: List[ConceptCoverageItem] = []
    communication_metrics: Optional[Dict[str, Any]] = None
    structure_breakdown: Optional[Dict[str, Any]] = None

    # Strict Scientific Correctness delineation
    has_ground_truth: bool = False
    technical_correctness_status: str = "unverified"
    technical_correctness_disclaimer: str = (
        "Semantic coverage verifies topical relevance and conceptual alignment, "
        "but cannot verify mathematical, algorithmic, or factual correctness without "
        "a verified reference solution."
    )
