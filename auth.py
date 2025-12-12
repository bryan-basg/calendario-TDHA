# -*- coding: utf-8 -*-
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt

# Monkeypatch para compatibilidad passlib <-> bcrypt 4.0+
try:
    bcrypt.__about__
except AttributeError:

    class About:
        __version__ = bcrypt.__version__

    bcrypt.__about__ = About()

import os

from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()


# CONFIGURACIÓN
# ¡IMPORTANTE! En producción, estos valores deben estar en variables de entorno

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# Validación de SECRET_KEY
if not SECRET_KEY:
    # En desarrollo, generar una clave temporal
    import secrets

    SECRET_KEY = secrets.token_urlsafe(32)
    import warnings

    warnings.warn(
        "⚠️  SECRET_KEY no configurada! Usando clave temporal. "
        "Para generar una clave segura ejecuta: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
    )
elif len(SECRET_KEY) < 32:
    raise ValueError(
        "❌ SECRET_KEY es demasiado corta (mínimo 32 caracteres). "
        "Genera una clave segura con: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
    )
elif SECRET_KEY == "tu_clave_secreta_super_segura_y_aleatoria_cambialaprod":
    if os.getenv("TESTING"):
        import warnings

        warnings.warn("⚠️  TESTING MODE: Usando SECRET_KEY por defecto.")
    else:
        raise ValueError(
            "❌ ¡PELIGRO! Usando SECRET_KEY por defecto del código. "
            "Genera una clave segura con: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
        )


# Contexto para Hashing de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
