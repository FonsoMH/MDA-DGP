from flask import Blueprint, request, jsonify
from .db import get_db_cursor

bp = Blueprint('users', __name__)


@bp.route('/users', methods=['GET'])
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
    cur.close()

    users = [
        {
            'id': row['user_id'],
            'name': row['name'],
            'email': row['email'],
            'role': row['role_name']
        }
        for row in rows
    ]

    return jsonify(users)

@bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    cur = get_db_cursor()
    cur.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))

    user = cur.fetchone()

    if not user:
        cur.close()
        return jsonify({'error': 'User not found.'}), 404
    
    cur.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
    cur.connection.commit()
    cur.close()

    return jsonify({'message': f'User {user_id} deleted successfully.'}), 200