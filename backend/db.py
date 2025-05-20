import psycopg2
from psycopg2 import sql
from datetime import timedelta
from typing import Optional


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

def insert_metrics(
    user_input: str,
    generate_sql_request_tokens: Optional[int] = None,
    provider: str = None,
    generated_sql: Optional[str] = None,
    generated_sql_duration_ms: Optional[float] = None,
    generated_sql_status: str = None,
    sql_result: Optional[str] = None,
    generate_interpretation_request_tokens: Optional[int] = None,
    generated_interpretation: Optional[str] = None,
    generated_interpretation_duration_ms: Optional[float] = None,
    generated_interpretation_status: str = None,
    language: Optional[str] = None,
    exception_msg: Optional[str] = None
):
    print("generated_sql_duration_ms", generated_sql_duration_ms)
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO assistant_metrics (
                user_input,
                generate_sql_request_tokens,
                provider,
                generated_sql,
                generated_sql_duration_ms,
                generated_sql_status,
                sql_result,
                generate_interpretation_request_tokens,
                generated_interpretation,
                generated_interpretation_duration_ms,
                generated_interpretation_status,
                language,
                exception_msg
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_input,
            generate_sql_request_tokens,
            provider,
            generated_sql,
            generated_sql_duration_ms,
            generated_sql_status,
            sql_result,
            generate_interpretation_request_tokens,
            generated_interpretation,
            generated_interpretation_duration_ms,
            generated_interpretation_status,
            language,
            exception_msg
        ))

        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print("Error inserting metrics:", str(e))


def get_metrics():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("""
        SELECT id, executed_at, provider, user_input,
               generated_sql_status, generated_interpretation_status,
               generated_sql_duration_ms, generated_interpretation_duration_ms
        FROM assistant_metrics
        ORDER BY executed_at DESC
        LIMIT 100
    """)
    columns = [desc[0] for desc in cur.description]
    results = [dict(zip(columns, row)) for row in cur.fetchall()]
    conn.close()
    return results