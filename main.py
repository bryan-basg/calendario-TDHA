from fastapi import FastAPI
from database import engine
import models

# Esta línea MÁGICA es la que crea las tablas automáticamente
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "¡La API del Calendario TDAH está viva!"}
