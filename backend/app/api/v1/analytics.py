"""Longitudinal Analytics and Historical Trend Endpoints."""

from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import numpy as np
from backend.app.database import get_db
from backend.app.models.session import SessionModel
from backend.app.models.metric import CommunicationMetric

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
async def get_analytics_overview(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """Calculates true aggregate metrics across all historical completed sessions."""
    res = await db.execute(
        select(SessionModel)
        .where(SessionModel.status == "completed")
        .order_by(desc(SessionModel.created_at))
    )
    sessions = res.scalars().all()
    total_sessions = len(sessions)

    if total_sessions == 0:
        return {
            "total_sessions": 0,
            "total_speech_minutes": 0.0,
            "personal_baseline": {
                "mean_wpm": 0.0,
                "mean_filler_density": 0.0,
                "mean_pause_duration": 0.0
            },
            "recent_sessions": []
        }

    total_speech_sec = sum(s.speech_duration_seconds for s in sessions)

    # Fetch global metrics for all completed sessions
    session_ids = [s.id for s in sessions]
    metrics_res = await db.execute(
        select(CommunicationMetric)
        .where(CommunicationMetric.session_id.in_(session_ids), CommunicationMetric.window_start == None)
    )
    all_metrics = metrics_res.scalars().all()

    wpms = [m.metric_value for m in all_metrics if m.metric_name == "wpm"]
    fillers = [m.metric_value for m in all_metrics if m.metric_name == "filler_density"]
    pauses = [m.metric_value for m in all_metrics if m.metric_name == "average_pause_seconds"]

    return {
        "total_sessions": total_sessions,
        "total_speech_minutes": round(total_speech_sec / 60.0, 1),
        "personal_baseline": {
            "mean_wpm": round(float(np.mean(wpms)), 1) if wpms else 0.0,
            "std_wpm": round(float(np.std(wpms)), 1) if wpms else 0.0,
            "mean_filler_density_pct": round(float(np.mean(fillers)), 2) if fillers else 0.0,
            "mean_pause_seconds": round(float(np.mean(pauses)), 2) if pauses else 0.0
        },
        "recent_sessions": [
            {
                "id": s.id,
                "title": s.title,
                "mode": s.mode,
                "duration_seconds": s.duration_seconds,
                "created_at": s.created_at
            }
            for s in sessions[:10]
        ]
    }


@router.get("/trends")
async def get_analytics_trends(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """Returns chronological session-by-session metric trends for longitudinal graphing."""
    res = await db.execute(
        select(SessionModel)
        .where(SessionModel.status == "completed")
        .order_by(SessionModel.created_at)
    )
    sessions = res.scalars().all()

    session_points = []
    for s in sessions:
        m_res = await db.execute(
            select(CommunicationMetric)
            .where(CommunicationMetric.session_id == s.id, CommunicationMetric.window_start == None)
        )
        s_metrics = {m.metric_name: m.metric_value for m in m_res.scalars().all()}
        session_points.append({
            "session_id": s.id,
            "title": s.title,
            "created_at": s.created_at.isoformat(),
            "wpm": s_metrics.get("wpm", 0.0),
            "filler_density": s_metrics.get("filler_density", 0.0),
            "average_pause_seconds": s_metrics.get("average_pause_seconds", 0.0),
            "repetition_rate": s_metrics.get("repetition_rate", 0.0),
            "coherence": s_metrics.get("mean_coherence", 1.0)
        })

    return {
        "session_count": len(session_points),
        "trends": session_points
    }
