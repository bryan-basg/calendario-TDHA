from database import SessionLocal
import models
from auth import get_password_hash

print("Conectando a DB para insertar usuario...")
try:
    db = SessionLocal()
    
    email = "test_user_debug@example.com"
    pwd = "password123"
    
    # Check if exists
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        print(f"Usuario {email} ya existe. ID: {existing.id}")
        db.delete(existing)
        db.commit()
        print("Usuario existente eliminado.")

    print(f"Creando usuario {email}...")
    user = models.User(email=email, hashed_password=get_password_hash(pwd))
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"Usuario creado exitosamente. ID: {user.id}")
    
except Exception as e:
    print(f"FATAL ERROR durante insert: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
