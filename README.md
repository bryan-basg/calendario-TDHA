# Calendario TDAH - API (FastAPI)

API backend para una aplicación de calendario diseñada para personas con TDAH. Incluye gestión de tareas, eventos, categorías, y priorización basada en niveles de energía.

## 🚀 Características

- ✅ Autenticación JWT
- 📅 Gestión de eventos con hora fija
- ✏️ Tareas con niveles de energía (bajo, medio, alto)
- 🗂️ Categorías con colores personalizables
- ⏱️ Modo de enfoque (Focus Mode) con seguimiento de interrupciones
- 🔔 Notificaciones push (Web y Capacitor)
- 🌍 Internacionalización (i18n) - Español e Inglés
- 📊 Timeline unificado de eventos y tareas

## 📋 Requisitos

- Python 3.9+
- Pip
- (Opcional) PostgreSQL para producción

## 🛠️ Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repo>
cd calendario-TDHA
```

2. Crear entorno virtual (recomendado):
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus valores
```

5. Ejecutar migraciones de base de datos:
```bash
alembic upgrade head
```

## 🏃 Ejecución

### Backend (API)

Para iniciar el servidor de desarrollo:

```bash
uvicorn main:app --reload
```

La API estará disponible en `http://127.0.0.1:8000`.

Documentación interactiva: `http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://127.0.0.1:5173`

## 📁 Estructura del Proyecto

```
calendario-TDHA/
├── main.py                 # Punto de entrada de la aplicación
├── models.py               # Modelos de base de datos (SQLAlchemy)
├── schemas.py              # Esquemas de validación (Pydantic)
├── crud.py                 # Operaciones CRUD
├── database.py             # Configuración de base de datos
├── auth.py                 # Autenticación y JWT
├── dependencies.py         # Dependencias de FastAPI
├── routers/                # Endpoints organizados por recurso
│   ├── auth_routes.py
│   ├── tasks.py
│   ├── events.py
│   ├── categories.py
│   ├── timeline.py
│   ├── notifications.py
│   └── focus.py
├── frontend/               # Aplicación React
│   ├── src/
│   ├── public/
│   └── package.json
├── tests/                  # Tests automatizados
├── legacy_tests/           # Tests antiguos (para referencia)
├── dev_tools/              # Scripts de desarrollo y debugging
│   ├── seed_db.py
│   ├── inspect_db.py
│   └── ...
├── alembic/                # Migraciones de base de datos
├── .env.example            # Plantilla de variables de entorno
├── .gitignore
├── README.md               # Este archivo
└── DEPLOYMENT.md           # Guía de deployment para producción
```

## 🧪 Pruebas

Ejecutar tests:

```bash
pytest tests/ -v
```

Para ver cobertura:

```bash
pytest --cov=. tests/
```

## 🗂️ Carpeta dev_tools/

La carpeta `dev_tools/` contiene scripts de utilidad para desarrollo:

- `seed_db.py` - Poblar base de datos con datos de prueba
- `inspect_db.py` - Inspeccionar contenido de la base de datos
- `verify_auth.py` - Probar flujo de autenticación
- Otros scripts de debugging y testing manual

**⚠️ IMPORTANTE**: Estos scripts son solo para desarrollo y NO deben desplegarse en producción.

## 🔐 Seguridad

### ⚠️  IMPORTANTE: Configurar SECRET_KEY antes de producción

Genera tu SECRET_KEY con:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Y añádela a `.env`. El sistema validará que:
- ✅ Esté configurada (no vacía)
- ✅ Tenga mínimo 32 caracteres
- ✅  No sea la clave por defecto del código

### Características de Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación mediante JWT
- Headers de seguridad configurados
- CORS configurado mediante variables de entorno
- Variables sensibles en archivo `.env`
- Validación automática de SECRET_KEY

## 🌐 Variables de Entorno

Ver `.env.example` para lista completa de variables necesarias.

Variables críticas:
- `SECRET_KEY` - Clave para firmar JWT (generar con `python -c "import secrets; print(secrets.token_hex(32))"`)
- `DATABASE_URL` - URL de conexión a base de datos
- `ALLOWED_ORIGINS` - Orígenes permitidos por CORS
- `ENVIRONMENT` - `development` o `production`

## 📚 Documentación de la API

La documentación interactiva está disponible en:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## 🚀 Deployment

Para instrucciones detalladas de deployment en producción, consulta [DEPLOYMENT.md](DEPLOYMENT.md).

Pasos resumidos:
1. Configurar variables de entorno para producción
2. Usar PostgreSQL en lugar de SQLite
3. Generar build del frontend (`npm run build`)
4. Configurar servidor web (Nginx recomendado)
5. Ejecutar con Gunicorn + Uvicorn workers
6. Habilitar HTTPS y HSTS

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 🐛 Reporte de Bugs

Si encuentras un bug, por favor abre un issue con:
- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots (si aplica)
- Logs relevantes

## 💡 Roadmap

- [ ] Sistema de roles y permisos para categorías
- [ ] Integración con calendarios externos (Google Calendar, Outlook)
- [ ] Modo offline con sincronización
- [ ] Análisis de productividad y estadísticas
- [ ] Widget de escritorio
- [ ] App móvil nativa (iOS/Android con Capacitor)
