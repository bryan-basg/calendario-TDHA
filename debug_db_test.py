from database import SessionLocal
import models
import crud

print("Conectando a DB...")
try:
    db = SessionLocal()
    print("Sesión creada.")
    
    email = "test_debug@example.com"
    print(f"Buscando usuario {email}...")
    user = crud.get_user_by_email(db, email)
    print(f"Resultado: {user}")
    
    if user:
        print(f"Password hash: {user.hashed_password}")
        
except Exception as e:
    print(f"FATAL ERROR durante query: {e}")
    import traceback
    traceback.print_exc()
finally:
    print("Cerrando sesión.")
