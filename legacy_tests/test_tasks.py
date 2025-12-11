import requests

BASE_URL = "http://127.0.0.1:8000"

def get_token():
    # Asume que el usuario test_jwt@example.com ya existe por el test anterior
    login_data = {
        "username": "test@example.com",
        "password": "testpassword"
    }
    r = requests.post(f"{BASE_URL}/token", data=login_data)
    if r.status_code == 200:
        return r.json()["access_token"]
    else:
        print(f"Error consiguiendo token: {r.status_code}")
        return None

def test_tasks_endpoint():
    print("--- Test Endpoint Protegido /tasks/ ---")
    
    # 1. Intento SIN token
    print("\n1. Probando acceso SIN token...")
    r = requests.get(f"{BASE_URL}/tasks/")
    if r.status_code == 401:
        print("PASS: Acceso denegado correctamente (401).")
    else:
        print(f"FAIL: Se esperaba 401, se recibió {r.status_code}")

    # 2. Intento CON token
    print("\n2. Probando acceso CON token...")
    token = get_token()
    if not token:
        print("SKIP: No se pudo obtener token para la prueba.")
        return

    print(f"DEBUG: Token used: {token}")
    with open("token.txt", "w") as f:
        f.write(token)
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}/tasks/", headers=headers)
    
    if r.status_code == 200:
        tasks = r.json()
        print(f"PASS: Acceso permitido. Tareas recuperadas: {len(tasks)}")
        print(f"Respuesta: {tasks}")
    else:
        print(f"FAIL: Error accediendo con token: {r.status_code} - {r.text}")

if __name__ == "__main__":
    test_tasks_endpoint()
