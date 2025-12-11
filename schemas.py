from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- 1. Enums (Para que coincidan con models.py) ---
from models import EnergyLevel


# --- 1.1 Category Schemas ---
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1)
    color_hex: Optional[str] = "#50C878"


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color_hex: Optional[str] = None


class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True


# --- 2. SECURITY SCHEMAS ---
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    id: Optional[str] = None
    email: Optional[str] = None


# --- 3. Schemas de TAREAS (Tasks) ---
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1)
    energy_required: EnergyLevel = EnergyLevel.medium
    deadline: Optional[datetime] = None
    planned_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    energy_required: Optional[EnergyLevel] = None
    deadline: Optional[datetime] = None
    planned_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    is_completed: Optional[bool] = None
    status: Optional[str] = None


class Task(TaskBase):
    id: int
    is_completed: bool
    status: str  # Simple str representation of enum
    user_id: int

    class Config:
        from_attributes = True


# --- 3.1 Unificación (Timeline) ---
class TimelineItem(BaseModel):
    id: int
    title: str
    start: datetime
    end: datetime
    type: str  # "event" o "task"
    color: Optional[str] = None
    is_completed: bool = False  # Solo relevante para tareas

    class Config:
        from_attributes = True


class NowView(BaseModel):
    current: Optional[TimelineItem] = None
    next: Optional[TimelineItem] = None


# --- 4. Schemas de EVENTOS (Events) ---
class EventBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime


class EventCreate(EventBase):
    category_id: int  # Necesitamos saber de qué categoría es


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    category_id: Optional[int] = None


class Event(EventBase):
    id: int
    user_id: int
    category_id: int

    class Config:
        from_attributes = True


# --- 5. Schemas de USUARIOS (Users) ---
class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str  # Aquí SI pedimos contraseña
    country: Optional[str] = "MX"


class User(UserBase):
    id: int
    is_active: bool = True
    country: str = "US"
    tasks: List[Task] = []  # Para ver sus tareas anidadas
class User(UserBase):
    id: int
    is_active: bool = True
    country: str = "US"
    tasks: List[Task] = []  # Para ver sus tareas anidadas
    events: List[Event] = []

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    country: Optional[str] = None
    # Add other fields as needed

