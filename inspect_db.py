from sqlalchemy import create_engine, inspect
from database import SQLALCHEMY_DATABASE_URL

print(f"Inspeccionando DB: {SQLALCHEMY_DATABASE_URL}")
engine = create_engine(SQLALCHEMY_DATABASE_URL)
inspector = inspect(engine)

try:
    columns = inspector.get_columns('users')
    print("Columnas en tabla 'users':")
    for column in columns:
        print(f"- {column['name']} ({column['type']})")

    has_country = any(c['name'] == 'country' for c in columns)
    print(f"\n¿Tiene columna 'country'? {has_country}")

except Exception as e:
    print(f"Error inspeccionando: {e}")
