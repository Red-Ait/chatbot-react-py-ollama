import psycopg2
from psycopg2 import sql

DB_CONFIG = {
    "dbname": "ml-prediction",
    "user": "postgres",
    "password": "admin",
    "host": "localhost",
    "port": 5432
}

def run_sql_query(query: str) -> str:
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute(query)
        try:
            result = cursor.fetchall()
        except psycopg2.ProgrammingError:
            result = "Query executed successfully (no result to fetch)."
        conn.commit()
        conn.close()
        return str(result)
    except Exception as e:
        return f"Error: {str(e)}"
