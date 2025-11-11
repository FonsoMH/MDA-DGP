from flask import Blueprint, request, jsonify
from ..db import get_db_cursor

users_bp = Blueprint('users', __name__, url_prefix='/api')

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

@users_bp.route('/users/<int:user_id>', methods=['GET'])
def delete_user(user_id):
    """
     Permite a un administrador eliminar un usuario y registrar la eliminación en la tabla user_deletion.
    """
    # Comprobamos que el usuario que realiza la eliminación es un administrador
    admin_id = request.args.get('admin_id', type=int)

    if not admin_id:
        return jsonify({'error': 'admin_id is required'}), 400
    
    cur = get_db_cursor()
    try:
        # Verificar que el admin_id corresponde a un administrador
        cur.execute("""
            SELECT user_id FROM users WHERE user_id = %s AND role_id = (SELECT role_id FROM roles WHERE role_name = 'admin')
        """, (admin_id,))
        admin = cur.fetchone()
        if not admin:
            return jsonify({'error': 'Unauthorized'}), 403

        # Verificar que el usuario a eliminar existe
        cur.execute("""
            SELECT user_id FROM users where user_id = %s
        """, (user_id,))
        user = cur.fetchone()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Insertamos el registro en user_deletion antes de eliminar el usuario
        cur.execute("""
            INSERT INTO user_deletion (delete_admin_id, delete_user_id, deleted_user_email, deleted_user_name)
            VALUES (%s, %s, %s, %s);
        """, (admin_id, user_id, user['email'], user['name']))

        # Eliminar el usuario
        cur.execute("DELETE FROM users WHERE user_id = %s;", (user_id,))

        cur.close()
        return jsonify({'message': 'User deleted successfully'}), 200
    
    except Exception as e:
        cur.close()
        return jsonify({'error': str(e)}), 500
