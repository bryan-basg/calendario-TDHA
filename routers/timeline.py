from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from database import get_db
from dependencies import get_current_user
import models, crud, schemas

router = APIRouter(
    prefix="/timeline",
    tags=["Timeline"]
)

@router.get("/", response_model=List[schemas.TimelineItem])
def read_timeline(
    start: datetime = None,
    end: datetime = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Si no se especifican fechas, usar HOY (00:00 a 23:59)
    if not start:
        now = datetime.now()
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    if not end:
        # Si se dio start pero no end, asumimos fin del día de start, O 24h despues?
        # Para consistencia con "Month View" que manda start y end explícitos,
        # si falta end, asumimos el final del día de 'start'.
        end = start.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    return crud.get_timeline(db, user_id=current_user.id, date_start=start, date_end=end)

@router.get("/now", response_model=schemas.NowView)
def read_now_view(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_now_view(db, user_id=current_user.id, current_time=datetime.now())
