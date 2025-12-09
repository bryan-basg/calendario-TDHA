import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Connect to 'postgres' db to create the new db
con = psycopg2.connect(
    dbname="postgres",
    user="postgres",
    password="root",
    host="localhost"
)

con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

cur = con.cursor()

try:
    print("Creating database 'calendario'...")
    cur.execute("CREATE DATABASE calendario;")
    print("Database 'calendario' created successfully.")
except psycopg2.errors.DuplicateDatabase:
    print("Database 'calendario' already exists.")
except Exception as e:
    print(f"Error creating database: {e}")
finally:
    cur.close()
    con.close()
