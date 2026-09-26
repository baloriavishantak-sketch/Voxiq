"""API v1 Master Router."""

from fastapi import APIRouter
from backend.app.api.v1.sessions import router as sessions_router
from backend.app.api.v1.analysis import router as analysis_router
from backend.app.api.v1.feedback import router as feedback_router
from backend.app.api.v1.analytics import router as analytics_router
from backend.app.api.v1.interview import router as interview_router

api_router = APIRouter()
api_router.include_router(sessions_router)
api_router.include_router(analysis_router)
api_router.include_router(feedback_router)
api_router.include_router(analytics_router)
api_router.include_router(interview_router)
