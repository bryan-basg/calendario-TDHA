from database import engine
import models
print("Creando tablas...")
try:
    models.Base.metadata.create_all(bind=engine)
    print("Tablas creadas exitosamente.")
except Exception as e:
    print(f"Error creando tablas: {e}")
