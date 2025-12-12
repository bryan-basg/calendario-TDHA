from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
import models
import schemas
from database import get_db
from dependencies import get_current_user
from services import recommendation_service

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/stats")
def get_task_stats(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    tasks = crud.get_tasks(db=db, user_id=current_user.id)
    completed = sum(
        1 for t in tasks if t.is_completed or t.status == models.TaskStatus.completed
    )
    incomplete = sum(
        1
        for t in tasks
        if not t.is_completed
        and t.status != models.TaskStatus.completed
        and t.status != models.TaskStatus.ignored
    )
    return {"completed": completed, "incomplete": incomplete}


@router.get("/", response_model=List[schemas.Task])
def read_tasks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Obtiene la lista de tareas del usuario con paginación.

    - skip: número de registros a saltar (default: 0)
    - limit: número máximo de registros a devolver (default: 100, max: 1000)
    """
    # Validar que limit no sea excesivo
    if limit > 1000:
        limit = 1000

    tasks = crud.get_tasks(db=db, user_id=current_user.id, skip=skip, limit=limit)
    return tasks


@router.post("/", response_model=schemas.Task, status_code=status.HTTP_201_CREATED)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.create_user_task(db=db, task=task, user_id=current_user.id)


@router.get("/suggestions", response_model=List[schemas.Task])
def get_task_suggestions(
    energy: models.EnergyLevel,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return recommendation_service.get_task_suggestions(
        db, user_id=current_user.id, current_energy=energy
    )


@router.get("/{task_id}", response_model=schemas.Task)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_task = crud.get_task(db, task_id=task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    if db_task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso")
    return db_task


@router.put("/{task_id}", response_model=schemas.Task)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # 1. Obtener la tarea
    db_task = crud.get_task(db, task_id=task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    # 2. Verificar que pertenece al usuario
    if db_task.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="No tienes permiso para modificar esta tarea"
        )

    return crud.update_task(db=db, task_id=task_id, task_update=task_update)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_task = crud.get_task(db, task_id=task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    if db_task.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="No tienes permiso para eliminar esta tarea"
        )

    crud.delete_task(db, task_id)
    return None


@router.patch("/{task_id}/complete", response_model=schemas.Task)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_task = crud.get_task(db, task_id=task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    if db_task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso")

    # Toggle complete
    new_status = not db_task.is_completed
    # Podríamos actualizar el enum status también si se usa
    task_update = schemas.TaskUpdate(is_completed=new_status)

    return crud.update_task(db, task_id, task_update)
