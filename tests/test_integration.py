import random
import string
import time

import requests

BASE_URL = "http://localhost:8000"


def get_random_string(length=10):
    return "".join(random.choice(string.ascii_letters) for i in range(length))


def run_tests():
    print("--- Starting Integration Tests ---")

    # 1. Register
    email = f"test_{get_random_string()}@example.com"
    password = "password123"
    print(f"\n1. Registering user: {email}")

    try:
        resp = requests.post(
            f"{BASE_URL}/users/", json={"email": email, "password": password}
        )
        if resp.status_code == 201:
            print("   [PASS] User created successfully")
        else:
            print(f"   [FAIL] Register failed: {resp.status_code} - {resp.text}")
            return
    except Exception as e:
        print(f"   [FAIL] Connection error: {e}")
        return

    # 2. Login
    print(f"\n2. Logging in")
    try:
        resp = requests.post(
            f"{BASE_URL}/token", data={"username": email, "password": password}
        )
        if resp.status_code == 200:
            token_data = resp.json()
            token = token_data["access_token"]
            print("   [PASS] Login successful. Token obtained.")
        else:
            print(f"   [FAIL] Login failed: {resp.status_code} - {resp.text}")
            return
    except Exception as e:
        print(f"   [FAIL] Connection error: {e}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Task
    print(f"\n3. Creating a Task")
    task_title = "Integration Test Task"
    task_data = {
        "title": task_title,
        "description": "Test description",
        "energy_level": "medium",
        "is_urgent": False,
    }

    resp = requests.post(f"{BASE_URL}/tasks/", json=task_data, headers=headers)
    if resp.status_code == 201:
        task = resp.json()
        print(f"   [PASS] Task created. ID: {task['id']}")
    else:
        print(f"   [FAIL] Task creation failed: {resp.status_code} - {resp.text}")
        return

    # 4. Get Tasks
    print(f"\n4. Retrieving Tasks")
    resp = requests.get(f"{BASE_URL}/tasks/", headers=headers)
    if resp.status_code == 200:
        tasks = resp.json()
        found = any(t["id"] == task["id"] for t in tasks)
        if found:
            print(f"   [PASS] Task {task['id']} found in list.")
        else:
            print(f"   [FAIL] Task {task['id']} NOT found in list.")
    else:
        print(f"   [FAIL] Get tasks failed: {resp.status_code} - {resp.text}")

    print("\n--- Integration Tests Completed Successfully ---")


if __name__ == "__main__":
    try:
        run_tests()
    except ImportError:
        print("requests library not found. Installing...")
        import os

        os.system("pip install requests")
        run_tests()
