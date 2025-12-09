from sqlalchemy import create_engine, text

# Try connecting to the default 'postgres' database
DATABASE_URL = "postgresql://postgres:root@localhost/postgres"

engine = create_engine(DATABASE_URL)

print(f"Attempting to connect to {DATABASE_URL} ...")
try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("Connection to 'postgres' DB successful! result:", result.scalar())
except Exception as e:
    # Use ascii regex or similar to avoid print errors if any
    try:
        print(f"Connection failed: {e}")
    except:
        print(f"Connection failed (repr): {repr(e)}")
