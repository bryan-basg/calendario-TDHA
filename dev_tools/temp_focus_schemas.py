from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class FocusSessionBase(BaseModel):
    task_id: Optional[int] = None
    start_time: datetime = Field(default_factory=datetime.now)


class FocusSessionCreate(FocusSessionBase):
    pass


class FocusSessionUpdate(BaseModel):
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    interruptions: Optional[int] = None
    interruption_notes: Optional[str] = None
    feedback_score: Optional[int] = None
    status: Optional[str] = None


class FocusSession(FocusSessionBase):
    id: int
    user_id: int
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
