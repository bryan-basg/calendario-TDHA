import re
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

# --- 1. Enums (Para que coincidan con models.py) ---
from models import EnergyLevel


# --- 1.1 Category Schemas ---
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1)
    color_hex: Optional[str] = "#50C878"

    @field_validator("color_hex")
    @classmethod
    def validate_color(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not re.match(r"^#(?:[0-9a-fA-F]{3}){1,2}$", v):
            raise ValueError("Invalid hex color format")
        return v


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

    @model_validator(mode="after")
    def validate_dates(self) -> "TaskBase":
        if self.planned_start and self.planned_end:
            if self.planned_end < self.planned_start:
                raise ValueError("planned_end must be after planned_start")
        return self


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

    @model_validator(mode="after")
    def validate_times(self) -> "EventBase":
        if self.end_time < self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


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


# --- 6. PUSH NOTIFICATIONS ---
class PushSubscriptionBase(BaseModel):
    endpoint: str
    keys: str  # JSON string {"p256dh": "...", "auth": "..."}
    platform: Optional[str] = "web"


class PushSubscriptionCreate(PushSubscriptionBase):
    pass


class PushSubscription(PushSubscriptionBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- 7. FOCUS SESSION SCHEMAS ---
class FocusSessionBase(BaseModel):
    task_id: Optional[int] = None
    # Start time sets automatically on backend usually, but can be passed


class FocusSessionCreate(FocusSessionBase):
    pass


class FocusSessionUpdate(BaseModel):
    # For patching status or adding interruptions
    status: Optional[str] = None
    interruption_notes: Optional[str] = None
    feedback_score: Optional[int] = None


class FocusSession(FocusSessionBase):
    id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: int
    interruptions: int
    interruption_notes: Optional[str] = None
    feedback_score: Optional[int] = None
    status: str

    class Config:
        from_attributes = True


class FocusStats(BaseModel):
    total_sessions: int
    total_minutes: int
    avg_score: float
    total_interruptions: int
