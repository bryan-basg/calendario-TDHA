# -*- coding: utf-8 -*-
import enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Interval,
    String,
)
from sqlalchemy.orm import relationship

from database import Base  # Importamos la base que creamos en el paso anterior


# Definimos los niveles de energía para TDAH
class EnergyLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)

    hashed_password = Column(String)
    country = Column(String, default="US")  # Default country for holidays

    # Relaciones
    events = relationship("Event", back_populates="owner")
    tasks = relationship("Task", back_populates="owner")
    categories = relationship("Category", back_populates="owner")
    push_subscriptions = relationship("PushSubscription", back_populates="owner")
    focus_sessions = relationship("FocusSession", back_populates="owner")


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    # El verde esmeralda por defecto que te gusta
    color_hex = Column(String, default="#50C878")

    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="categories")


class Event(Base):
    __tablename__ = "events"  # Eventos con hora fija (Citas, Clases)
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="events")

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    category = relationship("Category")


class TaskStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    ignored = "ignored"


class Task(Base):
    __tablename__ = "tasks"  # Tareas (Carga mental, sin hora fija necesaria)
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    is_completed = Column(
        Boolean, default=False
    )  # Mantener por compatibilidad, o migrar a status
    energy_required = Column(Enum(EnergyLevel), default=EnergyLevel.medium)
    deadline = Column(DateTime(timezone=True), nullable=True)

    # Nuevos campos para Time Blocking
    planned_start = Column(DateTime(timezone=True), nullable=True)
    planned_end = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.pending)

    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")


class PushSubscription(Base):
    __tablename__ = "push_subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    # Endpoint URL (from browser/device)
    endpoint = Column(String, nullable=False)

    # Keys for encryption (p256dh, auth) - JSON string or separate cols
    keys = Column(
        String, nullable=False
    )  # Guardaremos como JSON string {"p256dh": "...", "auth": "..."}

    platform = Column(String, default="web")  # web, android, list
    created_at = Column(DateTime(timezone=True), nullable=True)

    owner = relationship("User", back_populates="push_subscriptions")


class FocusSession(Base):
    __tablename__ = "focus_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)

    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)

    duration_minutes = Column(Integer, default=0)
    interruptions = Column(Integer, default=0)
    interruption_notes = Column(String, nullable=True)
    feedback_score = Column(Integer, nullable=True)

    status = Column(String, default="active")  # active, paused, completed

    owner = relationship("User", back_populates="focus_sessions")
    task = relationship("Task")
