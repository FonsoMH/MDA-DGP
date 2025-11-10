import random
import psycopg2
from ..db import get_db

def get_feedback_info():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT url, texto 
        FROM multimedia 
        WHERE type = 'fondo' AND feedback IS TRUE;
    """)

    all_feedbacks = cur.fetchall()

    random_feedback = random.choice(all_feedbacks)
    cur.close()

    return random_feedback