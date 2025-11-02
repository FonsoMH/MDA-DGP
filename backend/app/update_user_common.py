from flask import jsonify
from .db import get_db_cursor

def get_user_by_id(cur, user_id):
    cur.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
    return cur.fetchone()

def email_in_use(cur, email, exclude_user_id=None):
    if exclude_user_id:
        cur.execute("SELECT user_id FROM users WHERE email = %s AND user_id != %s", (email, exclude_user_id))
    else:
        cur.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    return cur.fetchone() is not None

def commit_or_rollback(cur, success=True):
    try:
        cur.execute("COMMIT;" if success else "ROLLBACK;")
    except Exception:
        pass
