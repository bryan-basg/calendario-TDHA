from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from database import engine
import models
from routers import auth_routes, tasks, events, categories, timeline

# Esta linea MAGICA es la que crea las tablas automaticamente
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0"]  # nosec
)


from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def debug_exception_handler(request: Request, exc: Exception):
    import traceback
    error_trace = traceback.format_exc()
    print(f"DEBUG CRASH HANDLER: {error_trace}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "debug_message": str(exc), "traceback": error_trace},
    )

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    # HSTS (Descomentar en produccion con HTTPS)
    # response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


# Incluir Routers
app.include_router(auth_routes.router)
app.include_router(tasks.router)
app.include_router(events.router)
app.include_router(categories.router)
app.include_router(timeline.router)


@app.get("/")
def read_root():
    return {"message": "La API del Calendario TDAH esta viva!"}

