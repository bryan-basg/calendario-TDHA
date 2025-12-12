# -*- coding: utf-8 -*-
import os

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from main import app

# Usar una base de datos nueva para cada sesión de pruebas o una en memoria
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_suite.db"


@pytest.fixture(scope="session")
def engine():
    if os.path.exists("./test_suite.db"):
        try:
            os.remove("./test_suite.db")
        except PermissionError:
            pass

    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    # Crear tablas una vez por sesión
    Base.metadata.create_all(bind=engine)
    yield engine
    # Limpiar después
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    if os.path.exists("./test_suite.db"):
        try:
            os.remove("./test_suite.db")
        except PermissionError:
            pass  # Ignorar si Windows mantiene el bloqueo


@pytest.fixture(scope="function")
def db_session(engine):
    """Retorna una sesión de base de datos limpia para cada test."""
    connection = engine.connect()
    transport = connection.begin()

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=connection)
    session = SessionLocal()

    yield session

    session.close()
    transport.rollback()
    connection.close()


@pytest_asyncio.fixture(scope="function")
async def client(db_session):
    """Cliente asíncrono con override de dependencia de BD."""

    def override_get_db():
        try:
            yield db_session
        finally:
            pass  # La sesión se cierra en el fixture db_session

    app.dependency_overrides[get_db] = override_get_db

    # Configurar transporte explícito para evitar problemas de Deprecation
    transport = ASGITransport(app=app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://localhost") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def auth_headers(client):
    """Fixture que proporciona headers de autenticación para un usuario de prueba"""
    import time

    # Crear usuario único por test
    email = f"test_user_{int(time.time() * 1000)}@example.com"
    password = "testpass123"

    # Registrar usuario
    await client.post("/users/", json={"email": email, "password": password})

    # Login
    login_resp = await client.post(
        "/token", data={"username": email, "password": password}
    )
    token = login_resp.json()["access_token"]

    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture(scope="function")
async def category_id(client, auth_headers):
    """Fixture que crea una categoría y retorna su ID"""
    cat_data = {"name": "Test Category", "color_hex": "#123456"}
    resp = await client.post("/categories/", json=cat_data, headers=auth_headers)
    return resp.json()["id"]
