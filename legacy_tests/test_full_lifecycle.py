import sys

import requests

BASE_URL = "http://127.0.0.1:8000"
USER_EMAIL = "test_crud@example.com"
USER_PASS = "crudpassword123"


def get_token():
    # 1. Crear usuario si no existe (o ignorar error 400)
    requests.post(
        f"{BASE_URL}/users/", json={"email": USER_EMAIL, "password": USER_PASS}
    )

    # 2. Login
    login_data = {"username": USER_EMAIL, "password": USER_PASS}
    r = requests.post(f"{BASE_URL}/token", data=login_data)
    if r.status_code == 200:
        return r.json()["access_token"]
    print(f"Error login: {r.status_code} {r.text}")
    sys.exit(1)


def test_lifecycle():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 1. CREATE TASK ---")
    task_data = {"title": "Task Original", "energy_required": "medium"}
    r = requests.post(f"{BASE_URL}/tasks/", json=task_data, headers=headers)
    assert r.status_code == 201, f"Create failed: {r.text}"
    task = r.json()
    task_id = task["id"]
    print(f"PASS: Created Task ID {task_id}")

    print("\n--- 2. READ TASK ---")
    r = requests.get(f"{BASE_URL}/tasks/", headers=headers)
    tasks = r.json()
    # Verificar que nuestra tarea está ahí
    found = any(t["id"] == task_id for t in tasks)
    assert found, "Task not found in list"
    print("PASS: Task found in list")

    print("\n--- 3. UPDATE TASK ---")
    update_data = {"title": "Task Updated", "energy_required": "high"}
    r = requests.put(f"{BASE_URL}/tasks/{task_id}", json=update_data, headers=headers)
    assert r.status_code == 200, f"Update failed: {r.text}"
    updated_task = r.json()
    assert updated_task["title"] == "Task Updated", "Title not updated"
    assert updated_task["energy_required"] == "high", "Energy not updated"
    print("PASS: Task Updated")

    print("\n--- 4. COMPLETE TASK (PATCH) ---")
    r = requests.patch(f"{BASE_URL}/tasks/{task_id}/complete", headers=headers)
    assert r.status_code == 200, f"Complete failed: {r.text}"
    completed_task = r.json()
    assert completed_task["is_completed"] == True, "Task not marked completed"
    print("PASS: Task Completed")

    print("\n--- 5. DELETE TASK ---")
    r = requests.delete(f"{BASE_URL}/tasks/{task_id}", headers=headers)
    assert r.status_code == 204, f"Delete failed: {r.text}"
    print("PASS: Task Deleted")

    print("\n--- 6. VERIFY DELETION ---")
    # Intentar actualizarla debería dar 404
    r = requests.put(f"{BASE_URL}/tasks/{task_id}", json=update_data, headers=headers)
    assert r.status_code == 404, f"Expected 404, got {r.status_code}"
    print("PASS: Deletion verified")

    print("\nSUCCESS: Full CRUD lifecycle verified!")


if __name__ == "__main__":
    test_lifecycle()
