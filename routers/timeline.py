from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import crud
import models
import schemas
from database import get_db
from dependencies import get_current_user
from services import timeline_service

router = APIRouter(prefix="/timeline", tags=["Timeline"])


@router.get("/", response_model=List[schemas.TimelineItem])
def read_timeline(
    start: datetime = None,
    end: datetime = None,
    max_items: int = 500,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Obtiene el timeline del usuario con eventos, tareas pautadas y festivos.

    - start: fecha de inicio (default: hoy 00:00)
    - end: fecha de fin (default: hoy 23:59)
    - max_items: máximo de items a devolver (default: 500, max: 1000)
    """
    # Si no se especifican fechas, usar HOY (00:00 a 23:59)
    if not start:
        now = datetime.now(timezone.utc)
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    if not end:
        # Si se dio start pero no end, asumimos fin del día de start, O 24h despues?
        # Para consistencia con "Month View" que manda start y end explícitos,
        # si falta end, asumimos el final del día de 'start'.
        end = start.replace(hour=23, minute=59, second=59, microsecond=999999)

    # Validar límite
    if max_items > 1000:
        max_items = 1000

    return timeline_service.get_timeline(
        db, user_id=current_user.id, date_start=start, date_end=end, max_items=max_items
    )


@router.get("/now", response_model=schemas.NowView)
def read_now_view(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    return timeline_service.get_now_view(
        db, user_id=current_user.id, current_time=datetime.now(timezone.utc)
    )
