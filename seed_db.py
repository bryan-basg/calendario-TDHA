from database import SessionLocal, engine
import models
import auth

def seed():
    print("Creando tablas...")
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if user 3 exists
        user = db.query(models.User).filter(models.User.id == 3).first()
        if not user:
            print("Creando usuario ID 3...")
            # We need to manually set ID to match the token
            # Note: hardcoding ID in Insert might require care with autoincrement, 
            # but usually in SQLite/SQLAlchemy explicitly setting id works if it doesn't exist.
            hashed_pwd = auth.get_password_hash("testpassword")
            user = models.User(id=3, email="test@example.com", hashed_password=hashed_pwd)
            db.add(user)
            db.commit()
            print("Usuario 3 creado.")
        else:
            print("Usuario 3 ya existe.")
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
