import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

import models
from database import engine
from routers import (
    auth_routes,
    categories,
    events,
    focus,
    notifications,
    tasks,
    timeline,
)

load_dotenv()

# IMPORTANTE: Ahora usamos Alembic para manejar migraciones de base de datos
# Para crear tablas: alembic upgrade head
# Para crear nueva migración después de modificar models.py: alembic revision --autogenerate -m "descripcion"
# Esta línea está comentada para evitar conflictos con Alembic:
# models.Base.metadata.create_all(bind=engine)

app = FastAPI(root_path="/api" if os.getenv("ENVIRONMENT") == "production" else "")

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Exception Handlers Globales
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"DB Error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error (Database)"},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )


# IMPORTANTE: El orden de los middlewares importa
# CORS debe ir PRIMERO para procesar las solicitudes preflight correctamente

# Obtener orígenes permitidos desde variable de entorno
# En desarrollo: localhost y 127.0.0.1
# En producción: el dominio real de tu aplicación
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # Permite que el navegador vea todos los headers de respuesta
)

# TrustedHost debe ir después de CORS
# Para producción, especificar dominios concretos en vez de "*"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
TRUSTED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"]
if ENVIRONMENT == "production":
    # En producción, agregar aquí tu dominio real
    # TRUSTED_HOSTS = ["tudominio.com", "www.tudominio.com"]
    pass

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=TRUSTED_HOSTS if ENVIRONMENT == "production" else ["*"],  # nosec
)


# Middleware de seguridad
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"

    # HSTS - Se habilita automáticamente en producción con HTTPS
    if (
        ENVIRONMENT == "production"
        and os.getenv("ENABLE_HSTS", "false").lower() == "true"
    ):
        response.headers[
            "Strict-Transport-Security"
        ] = "max-age=31536000; includeSubDomains"

    return response


# Incluir Routers
app.include_router(auth_routes.router)
app.include_router(tasks.router)
app.include_router(events.router)
app.include_router(categories.router)
app.include_router(timeline.router)
app.include_router(notifications.router)
app.include_router(focus.router)


@app.get("/")
def read_root():
    return {"message": "La API del Calendario TDAH esta viva!"}
