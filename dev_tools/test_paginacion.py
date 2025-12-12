# test_paginacion.py
"""
Script de prueba para validar la paginación de endpoints.
NO es un test unitario, solo un script de verificación rápida.
"""

import json

import requests

BASE_URL = "http://127.0.0.1:8000"


def test_pagination():
    # 1. Login para obtener token
    response = requests.post(
        f"{BASE_URL}/token",
        data={"username": "test@example.com", "password": "password"},
    )

    if response.status_code != 200:
        print("❌ Error en login. Asegúrate de tener un usuario test@example.com")
        print(f"   Respuesta: {response.status_code}")
        return

    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("✅ Login exitoso\n")

    # 2. Test GET /tasks/ con paginación
    print("📝 Probando GET /tasks/ con paginación...")

    # Sin parámetros (default: skip=0, limit=100)
    response = requests.get(f"{BASE_URL}/tasks/", headers=headers)
    if response.status_code == 200:
        tasks = response.json()
        print(f"   ✅ GET /tasks/ (default): {len(tasks)} tareas")
    else:
        print(f"   ❌ Error: {response.status_code}")

    # Con skip=0, limit=5
    response = requests.get(f"{BASE_URL}/tasks/?skip=0&limit=5", headers=headers)
    if response.status_code == 200:
        tasks = response.json()
        print(f"   ✅ GET /tasks/?skip=0&limit=5: {len(tasks)} tareas (máx 5)")
        if len(tasks) > 5:
            print("   ⚠️ WARNING: Límite no se aplicó correctamente")
    else:
        print(f"   ❌ Error: {response.status_code}")

    # Con limit excesivo (>1000 debe limitarse a 1000)
    response = requests.get(f"{BASE_URL}/tasks/?skip=0&limit=9999", headers=headers)
    if response.status_code == 200:
        tasks = response.json()
        print(f"   ✅ GET /tasks/?limit=9999: {len(tasks)} tareas (máx 1000 permitido)")
    else:
        print(f"   ❌ Error: {response.status_code}")

    print()

    # 3. Test GET /events/ con paginación
    print("📅 Probando GET /events/ con paginación...")

    response = requests.get(f"{BASE_URL}/events/", headers=headers)
    if response.status_code == 200:
        events = response.json()
        print(f"   ✅ GET /events/ (default): {len(events)} eventos")
    else:
        print(f"   ❌ Error: {response.status_code}")

    response = requests.get(f"{BASE_URL}/events/?skip=0&limit=3", headers=headers)
    if response.status_code == 200:
        events = response.json()
        print(f"   ✅ GET /events/?skip=0&limit=3: {len(events)} eventos (máx 3)")
    else:
        print(f"   ❌ Error: {response.status_code}")

    print()

    # 4. Test GET /timeline/ con max_items
    print("🗓️ Probando GET /timeline/ con max_items...")

    response = requests.get(f"{BASE_URL}/timeline/", headers=headers)
    if response.status_code == 200:
        timeline = response.json()
        print(f"   ✅ GET /timeline/ (default): {len(timeline)} items")
    else:
        print(f"   ❌ Error: {response.status_code}")

    response = requests.get(f"{BASE_URL}/timeline/?max_items=10", headers=headers)
    if response.status_code == 200:
        timeline = response.json()
        print(f"   ✅ GET /timeline/?max_items=10: {len(timeline)} items")
    else:
        print(f"   ❌ Error: {response.status_code}")

    print()

    # 5. Verificar documentación automática
    print("📚 Verificando documentación en /docs...")
    response = requests.get(f"{BASE_URL}/docs")
    if response.status_code == 200:
        print("   ✅ Documentación disponible en http://127.0.0.1:8000/docs")
        print("   💡 Verifica que los parámetros skip, limit, max_items aparezcan")
    else:
        print(f"   ❌ Error: {response.status_code}")

    print("\n✅ Pruebas completadas!")


if __name__ == "__main__":
    print("🧪 Test de Paginación de Endpoints\n")
    print("⚠️ Asegúrate de que el servidor esté corriendo en http://127.0.0.1:8000\n")

    try:
        test_pagination()
    except requests.exceptions.ConnectionError:
        print("❌ No se pudo conectar al servidor")
        print("   Asegúrate de ejecutar: uvicorn main:app --reload")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
