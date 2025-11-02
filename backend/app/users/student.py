from flask import Blueprint, request, jsonify, current_app
from ..db import get_db_cursor
from .user_common import get_user_by_id, email_in_use, commit_or_rollback

student_bp = Blueprint('student', __name__)

#TODO : Poner aquí el create_student cuando se haga merge de la gestion de students

@student_bp.route('/api/student/<int:user_id>', methods=['PUT'])
def update_student(user_id):
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    assigned_teacher_id = data.get('assigned_teacher_id')

    cur = get_db_cursor()
    try:
        user = get_user_by_id(cur, user_id)
        if not user:
            return jsonify({'error': 'Student not found.'}), 404

        fields, values = [], []

        if name:
            fields.append("name = %s")
            values.append(name)

        if email:
            if email_in_use(cur, email, exclude_user_id=user_id):
                return jsonify({'error': 'Email already in use.'}), 400
            fields.append("email = %s")
            values.append(email)

        if assigned_teacher_id is not None:
            fields.append("assigned_teacher_id = %s")
            values.append(assigned_teacher_id)

        if fields:
            query = f"UPDATE users SET {', '.join(fields)} WHERE user_id = %s"
            values.append(user_id)
            cur.execute(query, tuple(values))

        commit_or_rollback(cur, True)
        return jsonify({'message': 'Student updated successfully.'}), 200

    except Exception as e:
        commit_or_rollback(cur, False)
        current_app.logger.error(f"Error updating student {user_id}: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()
#TODO : queda hacer la logica para cambiar la contraseña

@student_bp.route('/api/student/<int:user_id>', methods=['DELETE'])
def delete_student(user_id):
    cur = get_db_cursor()
    try:
        user = get_user_by_id(cur, user_id)
        if not user:
            return jsonify({'error': 'Student not found.'}), 404

        cur.execute("DELETE FROM users WHERE user_id = %s", (user_id,))

        commit_or_rollback(cur, True)
        return jsonify({'message': 'Student deleted successfully.'}), 200

    except Exception as e:
        commit_or_rollback(cur, False)
        current_app.logger.error(f"Error deleting student {user_id}: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()