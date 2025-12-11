import pytest
import uuid

@pytest.mark.asyncio
async def test_auth_errors(client):
    # Login Failed - Wrong User
    response = await client.post("/token", data={"username": "wrong@example.com", "password": "pwd"})
    assert response.status_code == 401
    
    # Login Failed - Wrong Password
    # Primero creamos usuario
    email = f"auth_{uuid.uuid4()}@example.com"
    await client.post("/users/", json={"email": email, "password": "correct"})
    response = await client.post("/token", data={"username": email, "password": "wrong"})
    assert response.status_code == 401
    
    # Create Duplicate User
    response = await client.post("/users/", json={"email": email, "password": "new"})
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_not_found_errors(client):
    # Setup Auth
    email = f"nf_{uuid.uuid4()}@example.com"
    pwd = "pwd"
    await client.post("/users/", json={"email": email, "password": pwd})
    resp = await client.post("/token", data={"username": email, "password": pwd})
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get User 404
    resp = await client.get("/users/99999", headers=headers)
    assert resp.status_code == 404
    
    # Get Task 404
    resp = await client.get("/tasks/99999", headers=headers)
    assert resp.status_code == 404
    
    # Update Task 404
    resp = await client.put("/tasks/99999", json={"title": "New"}, headers=headers)
    assert resp.status_code == 404
    
    # Delete Task 404
    resp = await client.delete("/tasks/99999", headers=headers)
    assert resp.status_code == 404
    
    # Get Event 404
    resp = await client.get("/events/99999", headers=headers)
    assert resp.status_code == 404
    
    # Update Event 404
    resp = await client.put("/events/99999", json={"title": "New"}, headers=headers)
    assert resp.status_code == 404
    
    # Delete Event 404
    resp = await client.delete("/events/99999", headers=headers)
    assert resp.status_code == 404
    
    # Get Category 404
    resp = await client.get("/categories/99999", headers=headers)
    assert resp.status_code == 404

@pytest.mark.asyncio
async def test_validation_errors(client):
    email = f"val_{uuid.uuid4()}@example.com"
    pwd = "pwd"
    await client.post("/users/", json={"email": email, "password": pwd})
    resp = await client.post("/token", data={"username": email, "password": pwd})
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create Task Missing Fields
    resp = await client.post("/tasks/", json={}, headers=headers)
    assert resp.status_code == 422
    
    # Create Event Missing Category
    resp = await client.post("/events/", json={"title": "No Cat", "start_time": "2025-01-01T10:00:00"}, headers=headers)
    assert resp.status_code == 422

@pytest.mark.asyncio
async def test_permission_errors(client):
    # Crear Usuario 1
    u1_email = f"u1_{uuid.uuid4()}@example.com"
    await client.post("/users/", json={"email": u1_email, "password": "pwd"})
    resp1 = await client.post("/token", data={"username": u1_email, "password": "pwd"})
    token1 = resp1.json()["access_token"]
    h1 = {"Authorization": f"Bearer {token1}"}
    
    # Crear Usuario 2
    u2_email = f"u2_{uuid.uuid4()}@example.com"
    await client.post("/users/", json={"email": u2_email, "password": "pwd"})
    resp2 = await client.post("/token", data={"username": u2_email, "password": "pwd"})
    token2 = resp2.json()["access_token"]
    h2 = {"Authorization": f"Bearer {token2}"}
    
    # U1 crea tarea
    t1_resp = await client.post("/tasks/", json={"title": "U1 Task", "energy_required": "low"}, headers=h1)
    t1_id = t1_resp.json()["id"]
    
    # U2 intenta leer Tarea de U1
    resp = await client.get(f"/tasks/{t1_id}", headers=h2)
    assert resp.status_code == 403
    
    # U2 intenta actualizar Tarea de U1
    resp = await client.put(f"/tasks/{t1_id}", json={"title": "Hacked"}, headers=h2)
    assert resp.status_code == 403
    
    # U2 intenta borrar Tarea de U1
    resp = await client.delete(f"/tasks/{t1_id}", headers=h2)
    assert resp.status_code == 403
    
    # U2 intenta completar Tarea de U1
    resp = await client.patch(f"/tasks/{t1_id}/complete", headers=h2)
    assert resp.status_code == 403

    # Crear Categoría (común)
    c_resp = await client.post("/categories/", json={"name": "Common", "color_hex": "#000"}, headers=h1)
    cat_id = c_resp.json()["id"]

    # U1 crea evento
    e1_resp = await client.post("/events/", json={
        "title": "U1 Event", 
        "start_time": "2025-01-01T10:00:00",
        "end_time": "2025-01-01T11:00:00",
        "category_id": cat_id
    }, headers=h1)
    e1_id = e1_resp.json()["id"]
    
    # U2 intenta leer Evento de U1
    resp = await client.get(f"/events/{e1_id}", headers=h2)
    assert resp.status_code == 403
    
    # U2 intenta actualizar Evento de U1
    resp = await client.put(f"/events/{e1_id}", json={"title": "Hacked"}, headers=h2)
    assert resp.status_code == 403
    
    # U2 intenta borrar Evento de U1
    resp = await client.delete(f"/events/{e1_id}", headers=h2)
    assert resp.status_code == 403

@pytest.mark.asyncio
async def test_additional_endpoints(client):
    email = f"add_{uuid.uuid4()}@example.com"
    pwd = "pwd"
    await client.post("/users/", json={"email": email, "password": pwd})
    resp = await client.post("/token", data={"username": email, "password": pwd})
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create Task
    t_resp = await client.post("/tasks/", json={"title": "To Complete", "energy_required": "low"}, headers=headers)
    t_id = t_resp.json()["id"]
    
    # Complete Task
    resp = await client.patch(f"/tasks/{t_id}/complete", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["is_completed"] is True
    
    # Update Event validation (Category not found)
    # First create event
    c_resp = await client.post("/categories/", json={"name": "Cat", "color_hex": "#000"}, headers=headers)
    cat_id = c_resp.json()["id"]
    e_resp = await client.post("/events/", json={
        "title": "Event", 
        "start_time": "2025-01-01T10:00:00",
        "end_time": "2025-01-01T11:00:00",
        "category_id": cat_id
    }, headers=headers)
    e_id = e_resp.json()["id"]
    
    # Update with bad category
    resp = await client.put(f"/events/{e_id}", json={"category_id": 99999}, headers=headers)
    assert resp.status_code == 400
