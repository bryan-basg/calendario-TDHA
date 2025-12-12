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
    Las categorías son globales y todos los usuarios autenticados pueden verlas.
    """
    return crud.get_categories(db, skip=skip, limit=limit)


@router.get("/{category_id}", response_model=schemas.Category)
def read_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Obtener una categoría específica por ID."""
    db_category = crud.get_category(db, category_id=category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category


@router.post("/", response_model=schemas.Category, status_code=status.HTTP_201_CREATED)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Crear una nueva categoría.

    NOTA: Actualmente las categorías son globales y cualquier usuario autenticado
    puede crear categorías. Para restringir a solo administradores:

    1. Agregar campo 'is_admin' en el modelo User
    2. Descomentar las siguientes líneas:

    # if not getattr(current_user, 'is_admin', False):
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Only administrators can create categories"
    #     )
    """
    return crud.create_category(db=db, category=category)


@router.put("/{category_id}", response_model=schemas.Category)
def update_category(
    category_id: int,
    category: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Actualizar una categoría existente.

    NOTA: Actualmente las categorías son globales. Para agregar permisos:

    Opción 1 - Solo admins pueden editar:
    # if not getattr(current_user, 'is_admin', False):
    #     raise HTTPException(status_code=403, detail="Admin access required")

    Opción 2 - Agregar owner_id a categorías y verificar propiedad:
    # db_category = crud.get_category(db, category_id)
    # if db_category.owner_id != current_user.id and not getattr(current_user, 'is_admin', False):
    #     raise HTTPException(status_code=403, detail="Not authorized")
    """
    db_category = crud.update_category(db, category_id, category)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Eliminar una categoría.

    NOTA: Actualmente las categorías son globales. Para agregar permisos:

    # if not getattr(current_user, 'is_admin', False):
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Only administrators can delete categories"
    #     )
    """
    db_category = crud.delete_category(db, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return None
