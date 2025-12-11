# Calendario TDAH - API (FastAPI)

API backend para una aplicación de calendario diseñada para personas con TDAH. Incluye gestión de tareas, eventos, categorías, y priorización basada en niveles de energía.

## Requisitos

- Python 3.9+
- Pip

## Instalación

1.  Clonar el repositorio.
2.  Crear entorno virtual (recomendado):
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # Linux/Mac
    .venv\Scripts\activate     # Windows
    ```
3.  Instalar dependencias:
    ```bash
    pip install "fastapi[all]" sqlalchemy alembic passlib[bcrypt] pyjwt httpx
    ```

## Ejecución

Para iniciar el servidor de desarrollo:

```bash
uvicorn main:app --reload
```

La API estará disponible en `http://127.0.0.1:8000`. Interactúa con la documentación automática en `http://127.0.0.1:8000/docs`.

## Pruebas

Para ejecutar las pruebas de integración:

```bash
python test_api.py
```
