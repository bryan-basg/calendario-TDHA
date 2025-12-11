from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from dependencies import get_current_user
import models, crud, schemas

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

@router.get("/", response_model=List[schemas.Category])
def read_categories(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) 
):
    # Por ahora todos pueden ver las categorías
    return crud.get_categories(db, skip=skip, limit=limit)

@router.get("/{category_id}", response_model=schemas.Category)
def read_category(
    category_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_category = crud.get_category(db, category_id=category_id)
    if not db_category:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@router.post("/", response_model=schemas.Category, status_code=status.HTTP_201_CREATED)
def create_category(
    category: schemas.CategoryCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # TODO: En el futuro, restringir a admins
    return crud.create_category(db=db, category=category)

@router.put("/{category_id}", response_model=schemas.Category)
def update_category(
    category_id: int,
    category: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # TODO: Verificar permisos
    db_category = crud.update_category(db, category_id, category)
    if not db_category:
         from fastapi import HTTPException
         raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # TODO: Verificar permisos
    db_category = crud.delete_category(db, category_id)
    if not db_category:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Category not found")
    return None
