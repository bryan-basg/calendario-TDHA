from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base # Importamos la base que creamos en el paso anterior

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
    
    # Relaciones
    events = relationship("Event", back_populates="owner")
    tasks = relationship("Task", back_populates="owner")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    # El verde esmeralda por defecto que te gusta
    color_hex = Column(String, default="#50C878") 

class Event(Base):
    __tablename__ = "events" # Eventos con hora fija (Citas, Clases)
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="events")

class Task(Base):
    __tablename__ = "tasks" # Tareas (Carga mental, sin hora fija necesaria)
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    is_completed = Column(Boolean, default=False)
    energy_required = Column(Enum(EnergyLevel), default=EnergyLevel.medium)
    deadline = Column(DateTime(timezone=True), nullable=True)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")
