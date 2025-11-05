from flask import Blueprint, request, jsonify
from ..db import get_db_cursor

users_bp = Blueprint('users', __name__)


@users_bp.route('/users', methods=['GET'])
def get_users():
    # filter by role
    role = request.args.get('role')

    # filter by name
    name = request.args.get('name')

    cur = get_db_cursor()

    if role:
        cur.execute("""
            SELECT u.user_id, u.name, u.email, r.role_name
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE r.role_name = %s
            ORDER BY u.name
        """, (role,))
    elif name:
        cur.execute("""
            SELECT u.user_id, u.name, u.email, r.role_name
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE u.name ILIKE %s
            ORDER BY u.name
        """, (f'%{name}%',))
    else:
        cur.execute("""
            SELECT u.user_id, u.name, u.email, r.role_name
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            ORDER BY u.name
        """)

    rows = cur.fetchall()

    users = []
    for row in rows:
        user_dict = {
            'user_id': row['user_id'],
            'name': row['name'],
            'email': row['email'],
            'role': row['role_name']
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
    cur = get_db_cursor()

    # Fetch the user and its role
    cur.execute("""
        SELECT u.user_id, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = %s
    """, (user_id,))

    user = cur.fetchone()

    if not user:
        cur.close()
        return jsonify({'error': 'User not found.'}), 404

    # Prevent deleting the last admin: ensure there's at least one admin left
    if user.get('role_name') == 'admin':
        cur.execute("""
            SELECT COUNT(*) as cnt
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE r.role_name = 'admin'
        """)
        count_row = cur.fetchone()
        # count may be returned under different key names depending on cursor; try common ones
        admin_count = None
        if count_row is None:
            admin_count = 0
        elif 'cnt' in count_row:
            admin_count = count_row['cnt']
        elif 'count' in count_row:
            admin_count = count_row['count']
        else:
            # take first value
            admin_count = list(count_row.values())[0]

        try:
            admin_count = int(admin_count)
        except Exception:
            admin_count = 0

        if admin_count <= 1:
            cur.close()
            return jsonify({'error': 'No se puede eliminar al último administrador del sistema. Debe haber al menos un administrador.'}), 400

    # Proceed to delete
    cur.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
    cur.connection.commit()
    cur.close()

    return jsonify({'message': f'User {user_id} deleted successfully.'}), 200
'''
# obtain user by id
@users_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    cur = get_db_cursor()
    cur.execute("""
        SELECT u.user_id, u.name, u.email, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = %s
    """, (user_id,))

    row = cur.fetchone()
    cur.close()

    if not row:
        return jsonify({'error': 'User not found.'}), 404

    user = {
        'id': row['user_id'],
        'name': row['name'],
        'email': row['email'],
        'role': row['role_name']
    }

    return jsonify(user)

# update user by id
@users_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()

    if not name or not email:
        return jsonify({'error': 'Every field is required.'}), 400

    cur = get_db_cursor()
    cur.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))

    user = cur.fetchone()

    if not user:
        cur.close()
        return jsonify({'error': 'User not found.'}), 404

    update_fields = []
    update_values = []

    if name:
        update_fields.append("name = %s")
        update_values.append(name)
    
    if email:
        update_fields.append("email = %s")
        update_values.append(email)

    update_values.append(user_id)

    update_query = f"UPDATE users SET {', '.join(update_fields)} WHERE user_id = %s"
    cur.execute(update_query, tuple(update_values))
    cur.connection.commit()
    cur.close()

    return jsonify({'message': f'User {user_id} updated successfully.'}), 200
'''