import time
from datetime import datetime, timedelta, timezone

import pytest


@pytest.mark.asyncio
async def test_full_integration_flow(client):
    # A) Registro de Usuario
    email = f"test_pytest_{int(time.time())}@example.com"
    password = "securepassword"

    response = await client.post("/users/", json={"email": email, "password": password})
    assert response.status_code == 201, f"Registro fallido: {response.text}"

    # B) Login (Obtener Token)
    response = await client.post(
        "/token", data={"username": email, "password": password}
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # C) Crear Categoría
    cat_data = {"name": "Pytest Category", "color_hex": "#00FF00"}
    response = await client.post("/categories/", json=cat_data, headers=headers)
    assert response.status_code == 201
    category_id = response.json()["id"]

    # D) Crear Tarea
    task_data = {
        "title": "Pytest Task",
        "energy_required": "high",
        "deadline": "2025-12-31T23:59:59Z",
    }
    response = await client.post("/tasks/", json=task_data, headers=headers)
    assert response.status_code == 201

    # E) Crear Evento
    event_data = {
        "title": "Pytest Event",
        "start_time": "2025-12-10T10:00:00Z",
        "end_time": "2025-12-10T11:00:00Z",
        "category_id": category_id,
    }
    response = await client.post("/events/", json=event_data, headers=headers)
    assert response.status_code == 201

    # E.2) Validar Categoría Inexistente
    event_bad = event_data.copy()
    event_bad["category_id"] = 9999
    response = await client.post("/events/", json=event_bad, headers=headers)
    assert response.status_code == 400

    # F) Validar Lectura Original
    resp_cat = await client.get("/categories/", headers=headers)
    assert len(resp_cat.json()) > 0

    resp_task = await client.get("/tasks/", headers=headers)
    assert len(resp_task.json()) > 0

    resp_event = await client.get("/events/", headers=headers)
    assert len(resp_event.json()) > 0

    # G) Prueba Time Blocking (Unificación)
    tb_task_data = {
        "title": "Blocked Pytest Task",
        "energy_required": "low",
        "planned_start": datetime.now(timezone.utc).isoformat(),
        "planned_end": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
    }
    response = await client.post("/tasks/", json=tb_task_data, headers=headers)
    assert response.status_code == 201

    # Consultar Timeline
    resp_timeline = await client.get("/timeline/", headers=headers)
    assert resp_timeline.status_code == 200
    items = resp_timeline.json()
    assert len(items) > 0

    # H) Prueba Vista "Now"
    resp_now = await client.get("/timeline/now", headers=headers)
    assert resp_now.status_code == 200
    now_data = resp_now.json()
    assert "current" in now_data
    assert "next" in now_data

    # I) Prueba Priorización
    resp_suggestions = await client.get(
        "/tasks/suggestions?energy=low", headers=headers
    )
    assert resp_suggestions.status_code == 200
