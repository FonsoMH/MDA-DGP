from flask import Blueprint, request, jsonify, current_app
from .user_common import commit_or_rollback
from ..db import get_db_cursor

users_bp = Blueprint('users', __name__, url_prefix='/api')

@users_bp.route('/users', methods=['GET'])
def get_users():
    role = request.args.get('role')
    name = request.args.get('name')

    requester_role = request.args.get('requester_role')

    if name:
        if requester_role != 'admin':
            return jsonify({'error': 'admin_id query parameter is required when filtering by name.'}), 400
    
    cur = get_db_cursor()

    query = """
        SELECT u.user_id, u.name, u.email, r.role_name, u.assigned_teacher_id
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE 1=1
    """
    
    params = []

    if role:
        query += " AND r.role_name = %s"
        params.append(role)
    
    if name:
        query += " AND u.name ILIKE %s"
        params.append(f"%{name}%")

    query += " ORDER BY u.name"

    cur.execute(query, tuple(params))
    rows = cur.fetchall()

    users = []
    for row in rows:
        user_dict = {
            'id': row['user_id'],
            'name': row['name'],
            'email': row['email'],
            'role': row['role_name'],
            'assignedTeacherId': row['assigned_teacher_id']
        }

        # If user is a teacher, fetch assigned students
        if row['role_name'] == 'teacher':
            cur.execute("""
                SELECT name FROM users
                WHERE assigned_teacher_id = %s
                ORDER BY name
            """, (row['user_id'],))
            students = cur.fetchall()
            user_dict['assignedStudents'] = [s['name'] for s in students]
            user_dict['studentsCount'] = len(students)

        users.append(user_dict)
    
    cur.close()
    return jsonify(users)


@users_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    admin_id = request.args.get('admin_id', type=int)
    if not admin_id:
        return jsonify({'error': 'admin_id query parameter is required.'}), 400

    cur = get_db_cursor()
    try:
        # Verificar si el usuario existe
        cur.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
        user = cur.fetchone()
        if not user:
            return jsonify({'error': 'User not found.'}), 404

        # Registrar la eliminación antes de borrar
        cur.execute("""
            INSERT INTO user_deletion (delete_admin_id, delete_user_id, deleted_user_email, deleted_at)
            VALUES (%s, %s, %s, NOW())
            RETURNING delete_admin_id, delete_user_id, deleted_user_email
        """, (admin_id, user_id, user['email']))

        deletion_record = cur.fetchone()

        # Borrar al usuario
        cur.execute("DELETE FROM users WHERE user_id = %s", (user_id,))

        commit_or_rollback(cur, True)

        # Devolver mensaje + registro para test
        return jsonify({
            'message': f'User {user_id} deleted successfully.',
            'user_deletion_record': deletion_record
        }), 200

    except Exception as e:
        commit_or_rollback(cur, False)
        current_app.logger.error(f"Error deleting user: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()