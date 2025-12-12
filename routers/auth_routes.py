from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

import auth
import crud
import models
import schemas
from database import get_db
from dependencies import get_current_user

router = APIRouter(tags=["Authentication"])


@router.post(
    "/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED
)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Verificar si ya existe un usuario con este email
    db_user = crud.get_user_by_email(db, email=user.email)

    if db_user:
        # 🛑 Si el usuario ya existe: Levantamos una excepción HTTP.
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    # 2. Si no existe: Llama a la función de CRUD para crearlo
    return crud.create_user(db=db, user=user)


@router.post("/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    # 1. Buscar usuario por email (el form_data usa 'username', pero nosotros usamos email)
    user = crud.get_user_by_email(db, email=form_data.username)

    # 2. Verificar si usuario existe y si la contraseña es correcta
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Generar token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.put("/users/me", response_model=schemas.User)
def update_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.update_user(db, current_user.id, user_update)
