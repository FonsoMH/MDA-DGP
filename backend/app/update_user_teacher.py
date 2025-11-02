from flask import Blueprint, request, jsonify, current_app
from psycopg2 import sql
from .db import get_db_cursor
from .update_user_common import get_user_by_id, email_in_use, commit_or_rollback

update_teacher_bp = Blueprint('update_teacher', __name__)

@update_teacher_bp.route('/api/user/update_teacher/<int:user_id>', methods=['PUT'])
def update_teacher(user_id):
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password_hash = (data.get('password_hash') or '').strip()
    assigned_students_ids = data.get('assigned_students_ids') or []

    cur = get_db_cursor()
    try:
        user = get_user_by_id(cur, user_id)
        if not user:
            return jsonify({'error': 'Teacher not found.'}), 404

        fields, values = [], []

        if name:
            fields.append("name = %s")
            values.append(name)

        if email:
            if email_in_use(cur, email, exclude_user_id=user_id):
                return jsonify({'error': 'Email already in use.'}), 400
            fields.append("email = %s")
            values.append(email)

        if password_hash:
            fields.append("password_hash = %s")
            values.append(password_hash)

        if fields:
            query = f"UPDATE users SET {', '.join(fields)} WHERE user_id = %s"
            values.append(user_id)
            cur.execute(query, tuple(values))

        if assigned_students_ids:
            cur.execute("""
                UPDATE users SET assigned_teacher_id = %s
                WHERE user_id = ANY(%s)
            """, (user_id, assigned_students_ids))

        commit_or_rollback(cur, True)
        return jsonify({'message': 'Teacher updated successfully.'}), 200

    except Exception as e:
        commit_or_rollback(cur, False)
        current_app.logger.error(f"Error updating teacher {user_id}: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()
