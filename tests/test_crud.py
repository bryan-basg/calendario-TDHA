import pytest
from sqlalchemy.orm import Session
import crud, schemas, models
from datetime import datetime, timedelta
from database import Base

# Fixture local para crear datos básicos
@pytest.fixture
def test_user(db_session):
    user_in = schemas.UserCreate(email="test_crud@example.com", password="password123")
    return crud.create_user(db_session, user_in)

@pytest.fixture
def test_category(db_session):
    cat_in = schemas.CategoryCreate(name="Work", color_hex="#000000")
    return crud.create_category(db_session, cat_in)

def test_user_management(db_session):
    # Create
    user_in = schemas.UserCreate(email="new@example.com", password="pwd")
    user = crud.create_user(db_session, user_in)
    assert user.email == "new@example.com"
    assert user.id is not None
    
    # Get by ID
    fetched = crud.get_user_by_id(db_session, user.id)
    assert fetched.email == user.email
    
    # Get by Email
    fetched_email = crud.get_user_by_email(db_session, "new@example.com")
    assert fetched_email.id == user.id
    
    # Non existent
    assert crud.get_user_by_id(db_session, 999) is None
    assert crud.get_user_by_email(db_session, "fake@example.com") is None

def test_category_management(db_session):
    # Create
    cat = crud.create_category(db_session, schemas.CategoryCreate(name="Home", color_hex="#fff"))
    assert cat.id is not None
    
    # Get individual
    fetched = crud.get_category(db_session, cat.id)
    assert fetched.name == "Home"
    
    # Get detailed list
    cats = crud.get_categories(db_session)
    assert len(cats) >= 1

def test_task_lifecycle(db_session, test_user):
    # Create
    task_in = schemas.TaskCreate(title="Test Task", energy_required="low")
    task = crud.create_user_task(db_session, task_in, test_user.id)
    assert task.id is not None
    assert task.user_id == test_user.id
    
    # Get
    fetched = crud.get_task(db_session, task.id)
    assert fetched.title == "Test Task"
    
    # Update
    update_data = schemas.TaskUpdate(title="Updated Title", is_completed=True)
    updated = crud.update_task(db_session, task.id, update_data)
    assert updated.title == "Updated Title"
    assert updated.is_completed is True
    
    # Delete
    deleted = crud.delete_task(db_session, task.id)
    assert deleted.id == task.id
    assert crud.get_task(db_session, task.id) is None
    
    # Update/Delete Non-existent
    assert crud.update_task(db_session, 999, update_data) is None
    assert crud.delete_task(db_session, 999) is None

def test_event_lifecycle(db_session, test_user, test_category):
    # Create
    start = datetime.now()
    end = start + timedelta(hours=1)
    event_in = schemas.EventCreate(
        title="Valid Event", 
        start_time=start, 
        end_time=end, 
        category_id=test_category.id
    )
    event = crud.create_user_event(db_session, event_in, test_user.id)
    assert event.id is not None
    
    # Get
    fetched = crud.get_event(db_session, event.id)
    assert fetched.title == "Valid Event"
    
    # List
    events = crud.get_events(db_session, test_user.id)
    assert len(events) == 1
    
    # Update
    evt_update = schemas.EventUpdate(title="Changed Event")
    updated = crud.update_event(db_session, event.id, evt_update)
    assert updated.title == "Changed Event"
    
    # Delete
    deleted = crud.delete_event(db_session, event.id)
    assert deleted.id == event.id
    assert crud.get_event(db_session, event.id) is None
    
    # Failures
    assert crud.update_event(db_session, 9999, evt_update) is None
    assert crud.delete_event(db_session, 9999) is None

def test_timeline_logic(db_session, test_user, test_category):
    now = datetime.now()
    
    # Crear Evento
    e1 = crud.create_user_event(db_session, schemas.EventCreate(
        title="Morning Meeting",
        start_time=now + timedelta(hours=1),
        end_time=now + timedelta(hours=2),
        category_id=test_category.id
    ), test_user.id)
    
    # Crear Tarea con horario
    t1 = crud.create_user_task(db_session, schemas.TaskCreate(
        title="Planned Work",
        energy_required="high",
        planned_start=now + timedelta(hours=2),
        planned_end=now + timedelta(hours=3)
    ), test_user.id)
    
    # Fetch Timeline
    timeline = crud.get_timeline(db_session, test_user.id, now, now + timedelta(hours=24))
    assert len(timeline) == 2
    assert timeline[0]["type"] == "event"
    assert timeline[1]["type"] == "task"

def test_now_view(db_session, test_user):
    now = datetime.now()
    
    # 1. Caso: Nada ahora, algo despues
    future_task = crud.create_user_task(db_session, schemas.TaskCreate(
        title="Future",
        energy_required="medium",
        planned_start=now + timedelta(minutes=30),
        planned_end=now + timedelta(minutes=60)
    ), test_user.id)
    
    view = crud.get_now_view(db_session, test_user.id, now)
    assert view["current"] is None
    assert view["next"]["id"] == future_task.id
    
    # 2. Caso: Algo ocurriendo AHORA
    current_task = crud.create_user_task(db_session, schemas.TaskCreate(
        title="Current",
        energy_required="high",
        planned_start=now - timedelta(minutes=10),
        planned_end=now + timedelta(minutes=10)
    ), test_user.id)
    
    view = crud.get_now_view(db_session, test_user.id, now)
    assert view["current"]["id"] == current_task.id
    # El "next" debería ser la future_task creada antes
    assert view["next"]["id"] == future_task.id

def test_task_suggestions(db_session, test_user):
    # Crear tareas varias
    # Tarea Urgente (Deadline mañana)
    t_urgent = crud.create_user_task(db_session, schemas.TaskCreate(
        title="Urgent",
        energy_required="medium",
        deadline=datetime.now() + timedelta(hours=10)
    ), test_user.id)
    
    # Tarea High Energy
    t_heavy = crud.create_user_task(db_session, schemas.TaskCreate(
        title="Heavy",
        energy_required="high"
    ), test_user.id)
    
    # Tarea Low Energy
    t_easy = crud.create_user_task(db_session, schemas.TaskCreate(
        title="Easy",
        energy_required="low"
    ), test_user.id)
    
    # Test Low Energy User -> Prefers Easy
    sug_low = crud.get_task_suggestions(db_session, test_user.id, models.EnergyLevel.low)
    # Debería priorizar Urgent primero (50 pts) y luego Easy (Low+Low=40 pts) vs Heavy (Low+High=-20)
    assert len(sug_low) == 3
    assert sug_low[0].id == t_urgent.id
    assert sug_low[1].id == t_easy.id
    
    # Test High Energy User -> Prefers Heavy (after urgent)
    sug_high = crud.get_task_suggestions(db_session, test_user.id, models.EnergyLevel.high)
    # Urgent first (50). Then Heavy (High+High=30). Then Easy (High+Low=10).
    assert sug_high[0].id == t_urgent.id
    assert sug_high[1].id == t_heavy.id

# Test para funcion auxiliar de timeline sin planned_end
def test_timeline_task_defaults(db_session, test_user):
    now = datetime.now()
    # Tarea solo con start
    t = crud.create_user_task(db_session, schemas.TaskCreate(
        title="No End",
        energy_required="low",
        planned_start=now
    ), test_user.id)
    
    timeline = crud.get_timeline(db_session, test_user.id, now, now + timedelta(hours=1))
    item = timeline[0]
    # Verifica que calculó 30 min por defecto
    expected_end = t.planned_start + timedelta(minutes=30)
    assert item["end"] == expected_end
