from unittest.mock import MagicMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.exc import SQLAlchemyError

from main import app


@pytest.mark.asyncio
async def test_sanitized_500_error(client, auth_headers):
    """Verificar que el error 500 está sanitizado"""
    # Patcheamos 'crud.get_tasks' donde se usa en routers/tasks.py
    # Como routers/tasks.py hace 'import crud', el nombre a patchear es 'routers.tasks.crud'
    # O más específicamente la función: 'routers.tasks.crud.get_tasks'

    with patch("routers.tasks.crud.get_tasks") as mock_get_tasks:
        # Simular error genérico
        mock_get_tasks.side_effect = ZeroDivisionError("Fallo matemático secreto")

        response = await client.get("/tasks/", headers=auth_headers)

        # Debe ser 500
        assert response.status_code == 500
        data = response.json()

        # Debe estar sanitizado
        assert data["detail"] == "Internal Server Error"
        # Verificar que NO contiene el mensaje original
        assert "Fallo matemático secreto" not in str(data)


@pytest.mark.asyncio
async def test_sanitized_db_error(client, auth_headers):
    """Verificar que el error de DB está sanitizado"""
    with patch("routers.tasks.crud.get_tasks") as mock_get_tasks:
        # Simular error de SQLAlchemy
        mock_get_tasks.side_effect = SQLAlchemyError("Error SQL: SELECT * FROM users")

        response = await client.get("/tasks/", headers=auth_headers)

        assert response.status_code == 500
        data = response.json()
        assert data["detail"] == "Internal Server Error (Database)"
        # Verificar que NO contiene detalles SQL
        assert "SELECT * FROM users" not in str(data)
