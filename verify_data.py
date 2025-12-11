from database import SessionLocal
import models
import crud

def verify_tasks():
    db = SessionLocal()
    try:
        user_id = 3
        print(f"Obteniendo tareas para user {user_id}")
        tasks = crud.get_tasks(db, user_id=user_id)
        print(f"Total tareas: {len(tasks)}")
        for t in tasks:
            print(f"ID: {t.id}, Title: {t.title}, Energy: {t.energy_required} (type: {type(t.energy_required)}), Completed: {t.is_completed}, Deadline: {t.deadline}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_tasks()
