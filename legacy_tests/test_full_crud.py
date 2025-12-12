# Comprehensive CRUD and Ownership Tests for Calendario TDHA API
import asyncio
from datetime import datetime, timedelta

import httpx
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db

# Setup test database (SQLite) and override get_db dependency
from main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_full_crud.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=engine)


async def run_tests():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # ---------- USER A ----------
        email_a = "user_a@example.com"
        pwd_a = "passwordA"
        # Register user A
        resp = await client.post("/users/", json={"email": email_a, "password": pwd_a})
        assert resp.status_code == 201, f"User A creation failed: {resp.text}"
        # Login A
        resp = await client.post(
            "/token", data={"username": email_a, "password": pwd_a}
        )
        assert resp.status_code == 200, f"User A login failed: {resp.text}"
        token_a = resp.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # ---------- USER B ----------
        email_b = "user_b@example.com"
        pwd_b = "passwordB"
        resp = await client.post("/users/", json={"email": email_b, "password": pwd_b})
        assert resp.status_code == 201, f"User B creation failed: {resp.text}"
        resp = await client.post(
            "/token", data={"username": email_b, "password": pwd_b}
        )
        assert resp.status_code == 200, f"User B login failed: {resp.text}"
        token_b = resp.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # ---------- CATEGORY ----------
        cat_resp = await client.post(
            "/categories/",
            json={"name": "TestCat", "color_hex": "#123456"},
            headers=headers_a,
        )
        assert cat_resp.status_code == 201, f"Category creation failed: {cat_resp.text}"
        cat_id = cat_resp.json()["id"]

        # ---------- CREATE TASK (User A) ----------
        task_data = {
            "title": "Task A1",
            "energy_required": "low",
            "deadline": (datetime.now() + timedelta(days=1)).isoformat(),
        }
        resp = await client.post("/tasks/", json=task_data, headers=headers_a)
        assert resp.status_code == 201, f"Create task A failed: {resp.text}"
        task_id = resp.json()["id"]

        # ---------- UPDATE TASK (User A) ----------
        update_data = {"title": "Task A1 Updated", "is_completed": True}
        resp = await client.put(
            f"/tasks/{task_id}", json=update_data, headers=headers_a
        )
        assert resp.status_code == 200, f"Update task A failed: {resp.text}"
        assert resp.json()["title"] == "Task A1 Updated"
        assert resp.json()["is_completed"] is True

        # ---------- OWNERSHIP CHECK (User B cannot modify User A's task) ----------
        resp = await client.put(
            f"/tasks/{task_id}", json={"title": "Hacked"}, headers=headers_b
        )
        assert (
            resp.status_code == 403
        ), "User B should not be able to modify User A's task"

        # ---------- DELETE TASK (User A) ----------
        resp = await client.delete(f"/tasks/{task_id}", headers=headers_a)
        assert resp.status_code == 204, f"Delete task A failed: {resp.text}"
        # Verify deletion
        resp = await client.get("/tasks/", headers=headers_a)
        assert all(
            t["id"] != task_id for t in resp.json()
        ), "Task still present after deletion"

        # ---------- CREATE EVENT (User B) ----------
        event_data = {
            "title": "Event B1",
            "start_time": datetime.now().isoformat(),
            "end_time": (datetime.now() + timedelta(hours=1)).isoformat(),
            "category_id": cat_id,
        }
        resp = await client.post("/events/", json=event_data, headers=headers_b)
        assert resp.status_code == 201, f"Create event B failed: {resp.text}"
        event_id = resp.json()["id"]

        # ---------- UPDATE EVENT (User B) ----------
        resp = await client.put(
            f"/events/{event_id}", json={"title": "Event B Updated"}, headers=headers_b
        )
        assert resp.status_code == 200, f"Update event B failed: {resp.text}"
        assert resp.json()["title"] == "Event B Updated"

        # ---------- OWNERSHIP CHECK (User A cannot delete User B's event) ----------
        resp = await client.delete(f"/events/{event_id}", headers=headers_a)
        assert resp.status_code == 403, "User A should not delete User B's event"

        # ---------- CLEANUP ----------
        await client.delete(f"/events/{event_id}", headers=headers_b)
        print("All CRUD and ownership tests passed.")


if __name__ == "__main__":
    asyncio.run(run_tests())
