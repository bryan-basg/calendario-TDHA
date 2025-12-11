import asyncio
import httpx
from main import app

# Configuración para pruebas asíncronas
TRANSPORT = httpx.ASGITransport(app=app)
BASE_URL = "http://test"

async def test_edge_cases():
    async with httpx.AsyncClient(transport=TRANSPORT, base_url=BASE_URL) as client:
        email = "edgecase@example.com"
        password = "testpass"
        # Login to get token
        login_resp = await client.post("/token", data={"username": email, "password": password})
        
        # Si el usuario no existe (puede pasar si se corren tests en orden aleatorio), lo creamos
        if login_resp.status_code == 401:
            await client.post("/users/", json={"email": email, "password": password})
            login_resp = await client.post("/token", data={"username": email, "password": password})
            
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Crear tarea con campos faltantes
        print("1. Testing Incomplete Task...")
        incomplete_task = {"title": "", "deadline": None, "energy_required": "high"}
        resp = await client.post("/tasks/", json=incomplete_task, headers=headers)
        assert resp.status_code == 422
        print("PASS: 422 Unprocessable Entity received")

        # 2. Crear evento con category_id inexistente
        print("2. Testing Invalid Category ID...")
        event_data = {
            "title": "Evento inválido",
            "start_time": "2025-12-31T10:00:00",
            "end_time": "2025-12-31T11:00:00",
            "category_id": 9999,
            "energy_required": "low"
        }
        resp = await client.post("/events/", json=event_data, headers=headers)
        assert resp.status_code == 400
        print("PASS: 400 Bad Request received")

        # 3. Actualizar tarea que no pertenece al usuario (o inexistente)
        print("3. Testing Unauthorized Update...")
        other_task_id = 9999
        update_data = {"title": "Hack", "energy_required": "medium"}
        resp = await client.put(f"/tasks/{other_task_id}", json=update_data, headers=headers)
        # Puede ser 404 si no existe, o 403 si existe pero es de otro. Ambos son seguros.
        assert resp.status_code in (403, 404)
        print(f"PASS: {resp.status_code} received")

        # 4. Borrar evento inexistente
        print("4. Testing Delete Non-existent...")
        resp = await client.delete("/events/9999", headers=headers)
        assert resp.status_code == 404
        print("PASS: 404 Not Found received")

if __name__ == "__main__":
    try:
        asyncio.run(test_edge_cases())
        print("\n[SUCCESS] EDGE CASES PASSED")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"\n[FAIL] EDGE CASES FAILED: {e}")
