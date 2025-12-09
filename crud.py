from sqlalchemy.orm import Session
from passlib.context import CryptContext
import models, schemas

# Configuración para encriptar contraseñas (Hashing)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- FUNCIONES DE SEGURIDAD ---
def get_password_hash(password):
    return pwd_context.hash(password)

# --- USUARIOS (Users) ---
def get_user_by_email(db: Session, email: str):
    # Busca si ya existe un usuario con ese email
    return db.query(models.User).filter(models.User.email == email).first()

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
    return db_user

# --- TAREAS (Tasks) ---
def get_tasks(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Task).filter(models.Task.user_id == user_id).offset(skip).limit(limit).all()

def create_user_task(db: Session, task: schemas.TaskCreate, user_id: int):
    # Convertimos el esquema de Pydantic a Modelo de DB
    db_task = models.Task(**task.model_dump(), user_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# --- EVENTOS (Events) ---
def get_events(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Event).filter(models.Event.user_id == user_id).offset(skip).limit(limit).all()

def create_user_event(db: Session, event: schemas.EventCreate, user_id: int):
    db_event = models.Event(**event.model_dump(), user_id=user_id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event
