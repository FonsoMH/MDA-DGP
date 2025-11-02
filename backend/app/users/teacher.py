from flask import Blueprint, request, jsonify, current_app
from ..db import get_db_cursor
from psycopg2 import sql
from werkzeug.security import generate_password_hash
from .user_common import get_user_by_id, email_in_use, commit_or_rollback

teacher_bp = Blueprint('teacher', __name__)

@teacher_bp.route('/api/teacher', methods=['POST'])
def create_teacher():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()
    assigned_students_ids = data.get('assigned_students_ids') or []

    if not name or not email:
        return jsonify({'error': 'Name and email are required.'}), 400

    password_hash = generate_password_hash(password) if password else ''

    cur = get_db_cursor()
    try:
        # Obtener role_id del rol "teacher"
        cur.execute("SELECT role_id FROM roles WHERE role_name = %s", ('teacher',))
        role_row = cur.fetchone()
        if not role_row:
            return jsonify({'error': 'teacher role not found in the database.'}), 500
        role_id = role_row['role_id']

        # Verificar si el correo ya existe
        cur.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({'error': 'Email already exists.'}), 400

        # Insertar nuevo profesor
        insert_query = """
            INSERT INTO users (name, email, password_hash, role_id)
            VALUES (%s, %s, %s, %s)
            RETURNING user_id;
        """
        cur.execute(insert_query, (name, email, password_hash, role_id))
        new_teacher_id = cur.fetchone()['user_id']

        # Actualizar alumnos asignados (si hay)
        if assigned_students_ids:
            update_query = sql.SQL("""
                UPDATE users
                SET assigned_teacher_id = %s
                WHERE user_id = ANY(%s);
            """)
            cur.execute(update_query, (new_teacher_id, assigned_students_ids))

        # Confirmar la transacción
        cur.execute("COMMIT;")

        return jsonify({
            'id': new_teacher_id,
            'name': name,
            'email': email,
            'assigned_students_ids': assigned_students_ids
        }), 201

    except Exception as e:
        try:
            cur.execute("ROLLBACK;")
        except:
            pass
        current_app.logger.error(f"Error creating teacher: {e}")
        return jsonify({'error': 'internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()


@teacher_bp.route('/api/teacher/<int:user_id>', methods=['PUT'])
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


@teacher_bp.route('/api/teacher/<int:user_id>', methods=['DELETE'])
def delete_teacher(user_id):
    cur = get_db_cursor()
    try:
        user = get_user_by_id(cur, user_id)
        # Check if user exists
        if not user:
            return jsonify({'error': 'Teacher not found.'}), 404

        # Check for assigned students
        cur.execute("SELECT COUNT(*) FROM users WHERE assigned_teacher_id = %s", (user_id,))
        assigned_count = cur.fetchone()[0]
        if assigned_count > 0:
            return jsonify({'error': 'Cannot delete teacher with assigned students.'}), 400

        # Delete the teacher
        cur.execute("DELETE FROM users WHERE user_id = %s", (user_id,))

        commit_or_rollback(cur, True)
        return jsonify({'message': 'Teacher deleted successfully.'}), 200

    except Exception as e:
        commit_or_rollback(cur, False)
        current_app.logger.error(f"Error deleting teacher {user_id}: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()