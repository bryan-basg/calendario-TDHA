from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
import models
import schemas
from database import get_db
from dependencies import get_current_user

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/", response_model=List[schemas.Category])
def read_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Obtener lista de categorías.
    Solo se devuelven las categorías creadas por el usuario autenticado.
    """
    return crud.get_categories(db, user_id=current_user.id, skip=skip, limit=limit)


@router.get("/{category_id}", response_model=schemas.Category)
def read_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Obtener una categoría específica por ID. Solo el dueño puede verla."""
    db_category = crud.get_category(db, category_id=category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Verificar propiedad
    if db_category.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this category"
        )

    return db_category


@router.post("/", response_model=schemas.Category, status_code=status.HTTP_201_CREATED)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Crear una nueva categoría privada para el usuario autenticado.
    """
    return crud.create_category(db=db, category=category, user_id=current_user.id)


@router.put("/{category_id}", response_model=schemas.Category)
def update_category(
    category_id: int,
    category: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Actualizar una categoría existente. Solo el dueño puede editarla.
    """
    db_category = crud.get_category(db, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    if db_category.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to edit this category"
        )

    return crud.update_category(db, category_id, category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Eliminar una categoría. Solo el dueño puede eliminarla.
    """
    db_category = crud.get_category(db, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    if db_category.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this category"
        )

    return crud.delete_category(db, category_id)
