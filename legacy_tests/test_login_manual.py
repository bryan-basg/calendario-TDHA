import requests

def test_login():
    base_url = "http://127.0.0.1:8000"
    
    # 1. Crear usuario de prueba
    user_data = {"email": "test_jwt@example.com", "password": "securepassword123"}
    try:
        r = requests.post(f"{base_url}/users/", json=user_data)
        if r.status_code == 201:
            print("Usuario creado exitosamente.")
        elif r.status_code == 400 and "registrado" in r.text:
            print("El usuario ya existía (OK).")
        else:
            print(f"Error creando usuario: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"No se pudo conectar al servidor para crear usuario: {e}")
        return

    # 2. Intentar Login
    login_data = {
        "username": "test_jwt@example.com", # OAuth2 usa 'username' aunque sea email
        "password": "securepassword123"
    }
    
    try:
        r = requests.post(f"{base_url}/token", data=login_data)
        if r.status_code == 200:
            token_info = r.json()
            print("\n¡Login exitoso!")
            print(f"Token Type: {token_info.get('token_type')}")
            print(f"Access Token: {token_info.get('access_token')[:20]}... (truncado)")
        else:
            print(f"\nFallo en el login: {r.status_code} - {r.text}")
    except Exception as e:
         print(f"No se pudo conectar para login: {e}")

if __name__ == "__main__":
    test_login()
