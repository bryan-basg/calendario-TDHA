from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("Dropping table users...")
    conn.execute(text("DROP TABLE IF EXISTS users"))
    print("Table users dropped.")
    conn.commit()
