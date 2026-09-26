"""End-to-End Pipeline Integration Test."""

import io
import numpy as np
import soundfile as sf
import pytest
from httpx import AsyncClient


def create_test_wav_bytes(duration_sec: float = 3.0, sr: int = 16000) -> bytes:
    """Creates a real WAV audio file in-memory for testing the audio upload endpoint."""
    t = np.linspace(0, duration_sec, int(sr * duration_sec), endpoint=False)
    # 440 Hz tone with varying volume
    samples = (0.4 * np.sin(2 * np.pi * 440 * t)).astype(np.float32)
    # Add 0.8s silence in middle
    samples[int(sr * 1.0):int(sr * 1.8)] = 0.0

    buf = io.BytesIO()
    sf.write(buf, samples, sr, format="WAV", subtype="PCM_16")
    buf.seek(0)
    return buf.read()


@pytest.mark.asyncio
async def test_full_analysis_pipeline_and_endpoints(client: AsyncClient):
    # 1. Create a session
    sess_res = await client.post("/api/v1/sessions", json={"title": "E2E Audio Test", "mode": "practice"})
    assert sess_res.status_code == 201
    session_id = sess_res.json()["id"]

    # 2. Upload audio and run analysis
    wav_bytes = create_test_wav_bytes(duration_sec=3.0)
    files = {"file": ("test_audio.wav", wav_bytes, "audio/wav")}
    analyze_res = await client.post(f"/api/v1/sessions/{session_id}/analyze", files=files)
    assert analyze_res.status_code == 200
    analyze_data = analyze_res.json()
    assert analyze_data["status"] == "completed"
    assert analyze_data["duration_seconds"] > 0

    # 3. Retrieve session metrics
    metrics_res = await client.get(f"/api/v1/sessions/{session_id}/metrics")
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()
    assert "wpm" in metrics
    assert "pause_count" in metrics
    assert "filler_density" in metrics

    # 4. Retrieve session timeline
    timeline_res = await client.get(f"/api/v1/sessions/{session_id}/timeline")
    assert timeline_res.status_code == 200
    timeline = timeline_res.json()
    assert "windows" in timeline

    # 5. Retrieve feedback
    feedback_res = await client.get(f"/api/v1/sessions/{session_id}/feedback")
    assert feedback_res.status_code == 200
    feedback = feedback_res.json()
    assert "items" in feedback

    # 6. Retrieve analytics overview
    overview_res = await client.get("/api/v1/analytics/overview")
    assert overview_res.status_code == 200
    overview = overview_res.json()
    assert overview["total_sessions"] >= 1
    assert "personal_baseline" in overview

    # 7. Retrieve interview questions
    q_res = await client.get("/api/v1/interview/questions")
    assert q_res.status_code == 200
    questions = q_res.json()
    assert len(questions) >= 3
