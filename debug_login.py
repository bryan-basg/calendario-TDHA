import requests
import sys

# URL del backend
url = "http://127.0.0.1:8000/token"

# Datos de prueba (credenciales invalidas para forzar respuesta rápida)
data = {
    "username": "test_user_debug@example.com",
    "password": "password123"
}

print(f"Testing POST to {url}...")
try:
    response = requests.post(url, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except requests.exceptions.ConnectionError:
    print("Error: No se pudo conectar al servidor. Verifica que uvicorn esté corriendo en el puerto 8000.")
except Exception as e:
    print(f"Error inesperado: {e}")
