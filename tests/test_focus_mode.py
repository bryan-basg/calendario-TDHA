import pytest
from httpx import AsyncClient


# Helper to get auth token
async def get_auth_headers(
    client: AsyncClient, email="test_focus@example.com", password="password"
):
    # Register first (ignore 400 if exists)
    await client.post("/users/", json={"email": email, "password": password})
    response = await client.post(
        "/token", data={"username": email, "password": password}
    )
    if response.status_code != 200:
        # Maybe user exists with different password? Try to login directly or just fail
        pass
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_focus_flow(client):
    headers = await get_auth_headers(client)

    # 0. Clean slate check (might have previous sessions if DB reused, but factory creates new DB per session)
    # Actually conftest uses session-scoped engine but function-scoped db_session.
    # But it creates tables once. Data persists across tests? No, transaction rollback!
    # "transport.rollback()" in db_session fixture. So we are clean.

    # 1. Start Session
    res = await client.post("/focus/start", json={"task_id": None}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "active"
    session_id = data["id"]

    # 2. Try start another (should fail)
    res = await client.post("/focus/start", json={"task_id": None}, headers=headers)
    assert res.status_code == 400
    assert "already have an active focus session" in res.json()["detail"]

    # 3. Log interruption
    res = await client.post(
        f"/focus/{session_id}/interruption", params={"note": "Phone"}, headers=headers
    )
    assert res.status_code == 200
    assert res.json()["interruptions"] == 1

    # 4. Pause
    res = await client.post(f"/focus/{session_id}/pause", headers=headers)
    assert res.status_code == 200
    assert res.json()["status"] == "paused"

    # 5. Resume
    res = await client.post(f"/focus/{session_id}/resume", headers=headers)
    assert res.status_code == 200
    assert res.json()["status"] == "active"

    # 6. Stop
    res = await client.post(
        f"/focus/{session_id}/stop", params={"feedback_score": 5}, headers=headers
    )
    assert res.status_code == 200
    assert res.json()["status"] == "completed"
    assert res.json()["feedback_score"] == 5
    # Duration might be 0 since it was fast

    # 7. Stats
    res = await client.get("/focus/stats", headers=headers)
    assert res.status_code == 200
    stats = res.json()
    assert stats["total_sessions"] == 1
    assert stats["avg_score"] == 5.0
    assert stats["total_interruptions"] == 1
