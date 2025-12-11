import asyncio
import httpx
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import get_db, Base
import schemas
from datetime import datetime, timedelta

# 1. Configurar Base de Datos de Prueba (SQLite)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_api.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 2. Override de la dependencia get_db
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# 3. Inicializar tablas
Base.metadata.create_all(bind=engine)

# 4. Función de prueba Asíncrona
async def test_flow_completo():
    print("Iniciando pruebas de integración (ASYNC)...")
    
    # Configurar transporte y cliente asíncrono
    transport = httpx.ASGITransport(app=app)
    
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        
        # A) Registro de Usuario
        email = "test_api_async@example.com"
        password = "securepassword"
        
        response = await client.post("/users/", json={"email": email, "password": password})
        if response.status_code == 400: 
            print("Usuario ya existe, procediendo a login...")
        else:
            assert response.status_code == 201, f"Error al crear usuario: {response.text}"
        
        # B) Login (Obtener Token)
        response = await client.post("/token", data={"username": email, "password": password})
        assert response.status_code == 200, f"Error login: {response.text}"
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"Token obtenido: {token[:10]}...")

        # C) Crear Categoría
        cat_data = {"name": "Async Category", "color_hex": "#00FF00"}
        response = await client.post("/categories/", json=cat_data, headers=headers)
        assert response.status_code == 201, f"Error category: {response.text}"
        category_id = response.json()["id"]
        print(f"Categoría creada: ID {category_id}")

        # D) Crear Tarea
        task_data = {
            "title": "Async Task", 
            "energy_required": "high",
            "deadline": "2025-12-31T23:59:59"
        }
        response = await client.post("/tasks/", json=task_data, headers=headers)
        assert response.status_code == 201, f"Error task: {response.text}"
        print("Tarea creada exitosamente.")

        # E) Crear Evento
        event_data = {
            "title": "Async Event",
            "start_time": "2025-12-10T10:00:00",
            "end_time": "2025-12-10T11:00:00",
            "category_id": category_id
        }
        response = await client.post("/events/", json=event_data, headers=headers)
        assert response.status_code == 201, f"Error event: {response.text}"
        print("Evento creado exitosamente.")
        
        # E.2) Validar Categoría Inexistente
        print("Probando validación de categoría...")
        event_bad = event_data.copy()
        event_bad["category_id"] = 9999 # ID inexistente
        response = await client.post("/events/", json=event_bad, headers=headers)
        assert response.status_code == 400
        print("Validación correcta: No se crea evento con categoría inexistente.")

        # F) Validar Lectura Original
        resp_cat = await client.get("/categories/", headers=headers)
        assert len(resp_cat.json()) > 0
        resp_task = await client.get("/tasks/", headers=headers)
        assert len(resp_task.json()) > 0
        resp_event = await client.get("/events/", headers=headers)
        assert len(resp_event.json()) > 0
        print("Lectura de datos básicos exitosa.")

        # G) Prueba Time Blocking (Unificación)
        print("Probando Time Blocking...")
        tb_task_data = {
            "title": "Blocked Async Task",
            "energy_required": "low",
            "planned_start": datetime.now().isoformat(),
            "planned_end": (datetime.now() + timedelta(hours=1)).isoformat()
        }
        response = await client.post("/tasks/", json=tb_task_data, headers=headers)
        assert response.status_code == 201
        
        # Consultar Timeline
        resp_timeline = await client.get("/timeline/", headers=headers)
        assert resp_timeline.status_code == 200
        items = resp_timeline.json()
        print(f"Timeline recuperado: {len(items)} items")
        
        # H) Prueba Vista "Now"
        print("Probando Vista 'Ahora'...")
        resp_now = await client.get("/timeline/now", headers=headers)
        assert resp_now.status_code == 200
        now_data = resp_now.json()
        print(f"Vista Ahora: Current={now_data.get('current')}, Next={now_data.get('next')}")

        # I) Prueba Priorización
        print("Probando Sugerencias por Energía...")
        # Usamos el endpoint REAL
        resp_suggestions = await client.get("/tasks/suggestions?energy=low", headers=headers)
        assert resp_suggestions.status_code == 200
        sugg = resp_suggestions.json()
        print(f"Sugerencias obtenidas: {len(sugg)}")

if __name__ == "__main__":
    try:
        asyncio.run(test_flow_completo())
        print("\n[SUCCESS] PRUEBA DE INTEGRACION (ASYNC) EXITOSA")
    except AssertionError as e:
        print(f"\n[FAIL] FALLO LA PRUEBA: {e}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"\n[ERROR] ERROR INESPERADO: {e}")
