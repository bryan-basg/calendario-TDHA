from database import SessionLocal
import models
import crud

def test():
    print("Iniciando prueba de DB...")
    db = SessionLocal()
    try:
        print("Sesión creada.")
        user_id = 3 # Asumimos 3 porque el log anterior mostraba sub: 3
        print(f"Buscando usuario {user_id}...")
        user = crud.get_user_by_id(db, user_id=user_id)
        print(f"Resultado: {user}")
        if user:
            print(f"Email: {user.email}")
    except Exception as e:
        print(f"Excepción: {e}")
    finally:
        db.close()
        print("Sesión cerrada.")

if __name__ == "__main__":
    test()
