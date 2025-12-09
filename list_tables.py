from sqlalchemy import create_engine, text
from database import engine

print("🔍 Verificando tablas en PostgreSQL...")

try:
    with engine.connect() as connection:
        # Get connection info
        db_info = connection.execute(text("SELECT current_database(), current_user, inet_server_addr(), inet_server_port();")).fetchone()
        print(f"📡 Conectado a: Base de Datos='{db_info[0]}', Usuario='{db_info[1]}', Host='{db_info[2]}', Puerto='{db_info[3]}'")

        result = connection.execute(text(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
        ))
        tables = [row[0] for row in result]
        
    if tables:
        print(f"✅ Se encontraron {len(tables)} tablas en la esquema 'public':")
        for table in tables:
            print(f" - 📦 {table}")
    else:
        print("⚠️ No se encontraron tablas. Ejecuta crear_tablas.py nuevamente.")

except Exception as e:
    print(f"❌ Error al consultar PostgreSQL: {e}")

