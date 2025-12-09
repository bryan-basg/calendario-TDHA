from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, User, Category, Event, Task, EnergyLevel
from datetime import datetime, timedelta

# Use SQLite for local verification without Docker/PostgreSQL
DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_models():
    print("Creating tables in SQLite...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

    db = SessionLocal()
    try:
        # Create a User
        user = User(email="test@example.com", hashed_password="hashed_secret")
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"User created: {user.email} (ID: {user.id})")

        # Create a Category
        category = Category(name="Work", color_hex="#333333")
        db.add(category)
        db.commit()
        db.refresh(category)
        print(f"Category created: {category.name} (ID: {category.id})")

        # Create a Task
        task = Task(
            title="Finish Project",
            energy_required=EnergyLevel.high,
            user_id=user.id,
            deadline=datetime.now() + timedelta(days=1)
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        print(f"Task created: {task.title} (ID: {task.id}) - Energy: {task.energy_required.value}")

        # Create an Event
        event = Event(
            title="Meeting",
            start_time=datetime.now(),
            end_time=datetime.now() + timedelta(hours=1),
            user_id=user.id,

        )
        db.add(event)
        db.commit()
        print(f"Event created: {event.title}")

        print("\nSUCCESS: All models validated with SQLite.")
        
    except Exception as e:
        print(f"\nERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_models()
