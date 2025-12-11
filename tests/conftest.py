# -*- coding: utf-8 -*-
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import Base, get_db
import os

# Usar una base de datos nueva para cada sesión de pruebas o una en memoria
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_suite.db"

@pytest.fixture(scope="session")
def engine():
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False}
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
            pass # Ignorar si Windows mantiene el bloqueo

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
            pass # La sesión se cierra en el fixture db_session
            
    app.dependency_overrides[get_db] = override_get_db
    
    # Configurar transporte explícito para evitar problemas de Deprecation
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://localhost") as ac:
        yield ac
    
    app.dependency_overrides.clear()
