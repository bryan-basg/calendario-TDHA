from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

# --- 1. Enums (Para que coincidan con models.py) ---
class EnergyLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

# --- 2. Schemas de TAREAS (Tasks) ---
class TaskBase(BaseModel):
    title: str
    energy_required: EnergyLevel = EnergyLevel.medium
    deadline: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass # No necesitamos nada extra para crear

class Task(TaskBase):
    id: int
    is_completed: bool
    user_id: int

    class Config:
        from_attributes = True # Esto permite leer desde SQLAlchemy

# --- 3. Schemas de EVENTOS (Events) ---
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime

class EventCreate(EventBase):
    category_id: int # Necesitamos saber de qué categoría es

class Event(EventBase):
    id: int
    user_id: int
    category_id: int

    class Config:
        from_attributes = True

# --- 4. Schemas de USUARIOS (Users) ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str # Aquí SI pedimos contraseña

class User(UserBase):
    id: int
    is_active: bool = True
    tasks: List[Task] = [] # Para ver sus tareas anidadas
    events: List[Event] = []

    class Config:
        from_attributes = True
