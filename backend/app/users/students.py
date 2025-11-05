from flask import Blueprint, request, jsonify, current_app
from ..db import get_db_cursor
from psycopg2 import sql
from werkzeug.security import generate_password_hash
from .user_common import get_user_by_id, email_in_use, commit_or_rollback, check_basic_values

students_bp = Blueprint('students', __name__)

#TODO : Poner aquí el create_student cuando se haga merge de la gestion de students

@students_bp.route('/api/students/<int:user_id>', methods=['PUT'])
def update_student(user_id):
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()
    password_hash = None
    assigned_teacher_id = data.get('assigned_teacher_id')

    if password:
        password_hash = generate_password_hash(password)

    cur = get_db_cursor()
    try:
        user = get_user_by_id(cur, user_id)
        if not user:
            return jsonify({'error': 'Student not found.'}), 404

        fields, values = [], []

        fields, values = check_basic_values(cur, name, email, password_hash, user_id)

        if isinstance(fields, dict) and 'error' in fields:
            return jsonify(fields), values  # values contains the status code in this case
        
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


@students_bp.route('/api/students', methods=['POST'])
def create_student():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()
    assigned_teacher_id = data.get('assigned_teacher_id')

    if not name or not email or not password:
        return jsonify({'error': 'Name, email and password are required.'}), 400

    temp_cur = get_db_cursor()
    try:
        if email_in_use(temp_cur, email):
            temp_cur.close()
            return jsonify({'error': 'Email already in use.'}), 400
    finally:
        try:
            temp_cur.close()
        except Exception:
            pass

    password_hash = generate_password_hash(password)

    cur = get_db_cursor()
    try:
        # Obtener role_id del rol "student"
        cur.execute("SELECT role_id FROM roles WHERE role_name = %s", ('student',))
        role_row = cur.fetchone()
        if not role_row:
            return jsonify({'error': 'student role not found in the database.'}), 500
        role_id = role_row['role_id']

        insert_query = """
            INSERT INTO users (name, email, password_hash, role_id, assigned_teacher_id)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING user_id;
        """
        cur.execute(insert_query, (name, email, password_hash, role_id, assigned_teacher_id))
        new_id = cur.fetchone()['user_id']

        commit_or_rollback(cur, True)
        return jsonify({'user_id': new_id, 'name': name, 'email': email}), 201

    except Exception as e:
        commit_or_rollback(cur, False)
        current_app.logger.error(f"Error creating student: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()

@students_bp.route('/api/students/<int:user_id>', methods=['DELETE'])
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