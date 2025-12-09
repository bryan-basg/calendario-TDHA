from database import engine
from models import Base

print("🛠 Intentando conectar a la base de datos...")

try:
    # Esta es la línea que hace la magia
    Base.metadata.create_all(bind=engine)
    print("✅ ¡ÉXITO! Las tablas deberían estar creadas.")
except Exception as e:
    print(f"❌ ERROR FATAL: {e}")
