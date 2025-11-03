from flask import jsonify
from ..db import get_db_cursor

def get_user_by_id(cur, user_id):
    cur.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
    return cur.fetchone()

def check_basic_values(cur, name=None, email=None, password_hash=None, user_id=None):
    fields = []
    values = []

    if name:
        fields.append("name = %s")
        values.append(name)

    if email:
        # Verificar si el email ya está en uso
        if email_in_use(cur, email, exclude_user_id=user_id):
            return {'error': 'Email already in use.'}, 400
        fields.append("email = %s")
        values.append(email)

    if password_hash:
        fields.append("password_hash = %s")
        values.append(password_hash)

    return fields, values


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
