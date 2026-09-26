"""Tests for health endpoint and Session CRUD operations."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "VOXIQ"
    assert data["version"] == "1.0.0"


@pytest.mark.asyncio
async def test_session_lifecycle(client: AsyncClient):
    # 1. Create a session
    create_res = await client.post(
        "/api/v1/sessions",
        json={"title": "Technical Architecture Review", "mode": "interview"}
    )
    assert create_res.status_code == 201
    created = create_res.json()
    session_id = created["id"]
    assert created["title"] == "Technical Architecture Review"
    assert created["mode"] == "interview"
    assert created["status"] == "created"

    # 2. Get session by ID
    get_res = await client.get(f"/api/v1/sessions/{session_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == session_id

    # 3. List sessions
    list_res = await client.get("/api/v1/sessions")
    assert list_res.status_code == 200
    sessions = list_res.json()
    assert len(sessions) >= 1
    assert any(s["id"] == session_id for s in sessions)

    # 4. Update session
    update_res = await client.patch(
        f"/api/v1/sessions/{session_id}",
        json={"title": "Updated Session Title", "status": "completed", "duration_seconds": 125.4}
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["title"] == "Updated Session Title"
    assert updated["status"] == "completed"
    assert updated["duration_seconds"] == 125.4

    # 5. Delete session
    delete_res = await client.delete(f"/api/v1/sessions/{session_id}")
    assert delete_res.status_code == 204

    # 6. Verify 404 after deletion
    verify_res = await client.get(f"/api/v1/sessions/{session_id}")
    assert verify_res.status_code == 404
