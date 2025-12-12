from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
import models
import schemas
from database import get_db
from dependencies import get_current_user

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("/", response_model=List[schemas.Event])
def read_events(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Obtiene la lista de eventos del usuario con paginación.

    - skip: número de registros a saltar (default: 0)
    - limit: número máximo de registros a devolver (default: 100, max: 1000)
    """
    # Validar que limit no sea excesivo
    if limit > 1000:
        limit = 1000

    return crud.get_events(db=db, user_id=current_user.id, skip=skip, limit=limit)


@router.post("/", response_model=schemas.Event, status_code=status.HTTP_201_CREATED)
def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Validar que la categoría exista
    if not crud.get_category(db, category_id=event.category_id):
        raise HTTPException(status_code=400, detail="Categoría no encontrada")

    return crud.create_user_event(db=db, event=event, user_id=current_user.id)


@router.get("/{event_id}", response_model=schemas.Event)
def read_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_event = crud.get_event(db, event_id=event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if db_event.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso")
    return db_event


@router.put("/{event_id}", response_model=schemas.Event)
def update_event(
    event_id: int,
    event_update: schemas.EventUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_event = crud.get_event(db, event_id=event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    if db_event.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso")

    # Validar categoría si se actualiza
    if event_update.category_id is not None:
        if not crud.get_category(db, category_id=event_update.category_id):
            raise HTTPException(status_code=400, detail="Categoría no encontrada")

    return crud.update_event(db=db, event_id=event_id, event_update=event_update)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_event = crud.get_event(db, event_id=event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    if db_event.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso")

    crud.delete_event(db, event_id)
    return None
