from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session, joinedload

# from passlib.context import CryptContext # Ya no se necesita aquí
import models
import schemas
from auth import get_password_hash

# --- FUNCIONES DE SEGURIDAD ---
# (Las funciones de seguridad están centralizadas en auth.py)


# --- CATEGORÍAS (Categories) ---
def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()


def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(name=category.name, color_hex=category.color_hex)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(
    db: Session, category_id: int, category_update: schemas.CategoryUpdate
):
    db_category = get_category(db, category_id)
    if not db_category:
        return None

    update_data = category_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)

    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int):
    db_category = get_category(db, category_id)
    if not db_category:
        return None

    db.delete(db_category)
    db.commit()
    return db_category


def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()


# --- USUARIOS (Users) ---
def get_user_by_email(db: Session, email: str):
    # Busca si ya existe un usuario con ese email
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_user(db: Session, user: schemas.UserCreate):
    # 1. Encriptamos la contraseña
    hashed_password = get_password_hash(user.password)
    # 2. Preparamos el modelo de base de datos
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    # 3. Lo agregamos a la sesión
    db.add(db_user)
    # 4. Guardamos los cambios (Commit)
    db.commit()
    # 5. Refrescamos para obtener el ID generado automáticamente
    db.refresh(db_user)
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None

    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# --- TAREAS (Tasks) ---
def get_tasks(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Task)
        .filter(models.Task.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_user_task(db: Session, task: schemas.TaskCreate, user_id: int):
    # Convertimos el esquema de Pydantic a Modelo de DB
    db_task = models.Task(**task.model_dump(), user_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    db.refresh(db_task)
    return db_task


def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()


def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate):
    db_task = get_task(db, task_id)
    if not db_task:
        return None

    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    if not db_task:
        return None

    db.delete(db_task)
    db.commit()
    return db_task


# --- TIME BLOCKING & VISTAS ---
# Lógica movida a services/timeline_service.py y services/recommendation_service.py


# --- EVENTOS (Events) ---
def get_events(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """
    Obtiene eventos del usuario con eager loading de categoría.
    Usa joinedload para evitar problema N+1.
    """
    return (
        db.query(models.Event)
        .options(joinedload(models.Event.category))
        .filter(models.Event.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_user_event(db: Session, event: schemas.EventCreate, user_id: int):
    db_event = models.Event(**event.model_dump(), user_id=user_id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    db.refresh(db_event)
    return db_event


def get_event(db: Session, event_id: int):
    return db.query(models.Event).filter(models.Event.id == event_id).first()


def update_event(db: Session, event_id: int, event_update: schemas.EventUpdate):
    db_event = get_event(db, event_id)
    if not db_event:
        return None

    update_data = event_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)

    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def delete_event(db: Session, event_id: int):
    db_event = get_event(db, event_id)
    if not db_event:
        return None

    db.delete(db_event)
    db.commit()
    return db_event


# --- PUSH NOTIFICATIONS ---
def create_subscription(
    db: Session, subscription: schemas.PushSubscriptionCreate, user_id: int
):
    # Verificar si ya existe este endpoint para actualizarlo (un dispositivo puede actualizar sus llaves)
    existing = (
        db.query(models.PushSubscription)
        .filter(models.PushSubscription.endpoint == subscription.endpoint)
        .first()
    )

    if existing:
        existing.keys = subscription.keys
        existing.platform = subscription.platform
        # Aseguramos que pertenezca al usuario actual (si cambió de dueño el dispositivo, raro pero posible)
        existing.user_id = user_id
        db.commit()
        db.refresh(existing)
        return existing

    db_sub = models.PushSubscription(
        **subscription.model_dump(),
        user_id=user_id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub


def get_subscriptions(db: Session, user_id: int):
    return (
        db.query(models.PushSubscription)
        .filter(models.PushSubscription.user_id == user_id)
        .all()
    )
