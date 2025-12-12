"""
Tests adicionales para aumentar cobertura de routers
Cubre casos edge y funcionalidad faltante en tasks, events y categories
"""
import time
from datetime import datetime, timedelta, timezone

import pytest


@pytest.mark.asyncio
async def test_task_update_permissions(client, auth_headers):
    """Test que solo el dueño puede actualizar una tarea"""
    # Crear tarea con usuario 1
    task_data = {"title": "Task Usuario 1", "energy_required": "medium"}
    resp = await client.post("/tasks/", json=task_data, headers=auth_headers)
    assert resp.status_code == 201
    task_id = resp.json()["id"]

    # Intentar actualizar con otro usuario (debe fallar)
    other_user_email = f"otro_usuario_{int(time.time()*1000)}@test.com"
    await client.post(
        "/users/", json={"email": other_user_email, "password": "pass123"}
    )
    login_resp = await client.post(
        "/token", data={"username": other_user_email, "password": "pass123"}
    )
    other_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    update_resp = await client.put(
        f"/tasks/{task_id}", json={"title": "Hackeo"}, headers=other_headers
    )
    assert update_resp.status_code == 403


@pytest.mark.asyncio
async def test_task_delete_permissions(client, auth_headers):
    """Test que solo el dueño puede eliminar una tarea"""
    # Crear tarea
    task_data = {"title": "Task to Delete", "energy_required": "low"}
    resp = await client.post("/tasks/", json=task_data, headers=auth_headers)
    task_id = resp.json()["id"]

    # Crear otro usuario
    other_user_email = f"eliminar_{int(time.time()*1000)}@test.com"
    await client.post(
        "/users/", json={"email": other_user_email, "password": "pass123"}
    )
    login_resp = await client.post(
        "/token", data={"username": other_user_email, "password": "pass123"}
    )
    other_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    # Intentar eliminar (debe fallar)
    delete_resp = await client.delete(f"/tasks/{task_id}", headers=other_headers)
    assert delete_resp.status_code == 403


@pytest.mark.asyncio
async def test_task_complete_toggle(client, auth_headers):
    """Test del endpoint de completar/incompletar tarea"""
    # Crear tarea
    task_data = {"title": "Task to Complete", "energy_required": "high"}
    resp = await client.post("/tasks/", json=task_data, headers=auth_headers)
    task_id = resp.json()["id"]

    # Completar tarea
    complete_resp = await client.patch(
        f"/tasks/{task_id}/complete", headers=auth_headers
    )
    assert complete_resp.status_code == 200
    assert complete_resp.json()["is_completed"] == True

    # Incompletar tarea (toggle)
    incomplete_resp = await client.patch(
        f"/tasks/{task_id}/complete", headers=auth_headers
    )
    assert incomplete_resp.status_code == 200
    assert incomplete_resp.json()["is_completed"] == False


@pytest.mark.asyncio
async def test_task_not_found(client, auth_headers):
    """Test 404 cuando tarea no existe"""
    resp = await client.get("/tasks/99999", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_task_pagination(client, auth_headers):
    """Test paginación de tareas"""
    # Crear varias tareas
    for i in range(5):
        await client.post(
            "/tasks/",
            json={"title": f"Task {i}", "energy_required": "medium"},
            headers=auth_headers,
        )

    # Pedir con límite
    resp = await client.get("/tasks/?skip=0&limit=3", headers=auth_headers)
    assert resp.status_code == 200
    tasks = resp.json()
    assert len(tasks) <= 3


@pytest.mark.asyncio
async def test_event_update_permissions(client, auth_headers, category_id):
    """Test que solo el dueño puede actualizar un evento"""
    # Crear evento
    event_data = {
        "title": "Evento Original",
        "start_time": datetime.now(timezone.utc).isoformat(),
        "end_time": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
        "category_id": category_id,
    }
    resp = await client.post("/events/", json=event_data, headers=auth_headers)
    event_id = resp.json()["id"]

    # Crear otro usuario
    other_email = f"otro_evento_{int(time.time()*1000)}@evento.com"
    await client.post("/users/", json={"email": other_email, "password": "pass123"})
    login_resp = await client.post(
        "/token", data={"username": other_email, "password": "pass123"}
    )
    other_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    # Intentar actualizar (debe fallar)
    update_resp = await client.put(
        f"/events/{event_id}", json={"title": "Modificado"}, headers=other_headers
    )
    assert update_resp.status_code == 403


@pytest.mark.asyncio
async def test_event_not_found(client, auth_headers):
    """Test 404 cuando evento no existe"""
    resp = await client.get("/events/99999", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_category_get_single(client, auth_headers):
    """Test obtener categoría individual"""
    # Crear categoría
    cat_data = {"name": "Categoria Individual", "color_hex": "#FF0000"}
    create_resp = await client.post("/categories/", json=cat_data, headers=auth_headers)
    cat_id = create_resp.json()["id"]

    # Obtener categoría
    get_resp = await client.get(f"/categories/{cat_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "Categoria Individual"


@pytest.mark.asyncio
async def test_category_not_found(client, auth_headers):
    """Test 404 cuando categoría no existe"""
    resp = await client.get("/categories/99999", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_timeline_with_date_range(client, auth_headers, category_id):
    """Test timeline con rango de fechas"""
    # Crear evento en fecha específica
    start = datetime(2025, 12, 15, 10, 0, tzinfo=timezone.utc)
    end = datetime(2025, 12, 15, 11, 0, tzinfo=timezone.utc)

    event_data = {
        "title": "Evento Futuro",
        "start_time": start.isoformat(),
        "end_time": end.isoformat(),
        "category_id": category_id,
    }
    await client.post("/events/", json=event_data, headers=auth_headers)

    # Consultar timeline con rango
    resp = await client.get(
        f"/timeline/?start=2025-12-15T00:00:00Z&end=2025-12-16T00:00:00Z",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) > 0
