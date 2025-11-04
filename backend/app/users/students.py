from flask import Blueprint, request, jsonify, current_app
from ..db import get_db_cursor
from psycopg2 import sql
from werkzeug.security import generate_password_hash
from .user_common import get_user_by_id, email_in_use, commit_or_rollback, check_basic_values

students_bp = Blueprint('students', __name__)

@students_bp.route('/api/students', methods=['GET'])
def get_students():
    cur = None
    try:
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 10))
        # if page < 1:
        #     page = 1
        # if page_size < 1:
        #     page_size = 10
        # offset = (page - 1) * page_size
        offset = (page - 1) * page_size

        cur = get_db_cursor()

        cur.execute("SELECT role_id FROM roles WHERE role_name = %s", ('student',))
        role_row = cur.fetchone()

        student_role_id = role_row['role_id']

        cur.execute("SELECT COUNT(*) AS count FROM users WHERE role_id = %s AND assigned_teacher_id IS NULL", (student_role_id,))
        total_row = cur.fetchone()
        total_count = total_row['count'] if total_row else 0

        
        cur.execute("""
            SELECT user_id, name, email
            FROM users
            WHERE role_id = %s AND assigned_teacher_id IS NULL
            ORDER BY name ASC
            LIMIT %s OFFSET %s
        """, (student_role_id, page_size, offset))

        rows = cur.fetchall()

        
        students = [
            {
                'id': row['user_id'],
                'name': row['name'],
                'email': row['email']
            }
            for row in rows
        ]

        total_pages = (total_count + page_size - 1) // page_size if total_count else 0

        return jsonify({
            'items': students,
            'total_count': total_count,
            'total_pages': total_pages,
            'current_page': page
        }), 200

    except Exception as e:
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        if cur:
            try:
                cur.close()
            except Exception:
                pass


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
#TODO : queda hacer la logica para cambiar la contraseña

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