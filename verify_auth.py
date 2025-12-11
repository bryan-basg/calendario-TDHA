import requests
import schemas
import crud
import models
from database import SessionLocal, engine
import random
import string

# Aseguramos que las tablas existan
models.Base.metadata.create_all(bind=engine)

BASE_URL = "http://127.0.0.1:8000"


def generate_random_email():
    return f"user_{''.join(random.choices(string.ascii_lowercase, k=5))}@example.com"


def test_login():
    db = SessionLocal()
    try:
        # 1. Create a user manually
        email = generate_random_email()
        password = "secret_password"
        print(f"DTO: Creating user {email} with password {password}")

        user_in = schemas.UserCreate(email=email, password=password)
        created_user = crud.create_user(db, user_in)
        print(f"DTO: User created with ID {created_user.id}")

        # 2. Try to login via API
        print("DTO: Attempting login via /token endpoint...")
        response = requests.post(f"{BASE_URL}/token", data={
            "username": email,
            "password": password
        })

        if response.status_code == 200:
            token = response.json()
            print("DTO: Login SUCCESS!")
            print(f"DTO: Token received: {token}")
            if "access_token" in token and token["token_type"] == "bearer":
                print("DTO: Verification PASSED")
            else:
                print("DTO: Verification FAILED (Invalid token format)")
        else:
            print(f"DTO: Login FAILED with status {response.status_code}")
            print(f"DTO: Response: {response.text}")

        # 3. Test invalid password
        print("DTO: Testing invalid password...")
        bad_response = requests.post(f"{BASE_URL}/token", data={
            "username": email,
            "password": "wrong_password"
        })
        if bad_response.status_code == 401:
            print("DTO: Invalid password handled correctly (401)")
        else:
            print(f"DTO: Invalid password FAILED. Status: {bad_response.status_code}")

    finally:
        db.close()


if __name__ == "__main__":
    try:
        test_login()
    except Exception as e:
        print(f"DTO: Error encountered: {e}")

