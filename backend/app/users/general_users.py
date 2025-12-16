from flask import Blueprint, request, jsonify, current_app
from .user_common import commit_or_rollback
from ..db import get_db_cursor

users_bp = Blueprint('users', __name__, url_prefix='/api')

@users_bp.route('/users', methods=['GET'])
def get_users():
    try:
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 10))
        offset = int(request.args.get('offset', default=0))

        if page_size < 1: page_size = 10
        if page < 1: page = 1

        if offset is not None:
            offset = max(0, int(offset))
        else:
            offset = (page - 1) * page_size

        # filter by role
        role = request.args.get('role')
        # filter by name
        name = request.args.get('name')

        cur = get_db_cursor()

        base_query = """
            SELECT u.user_id, u.name, u.email, r.role_name, u.assigned_teacher_id
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
        """

        count_query = "SELECT COUNT(*) AS count FROM users u JOIN roles r ON u.role_id = r.role_id"
        where_clause = []
        where_clause_parts = []
        params = []

        if role:
            where_clause_parts.append("r.role_name = %s")
            params.append(role)
        
        # 2. Filtro por Nombre (ILIKE)
        if name:
            where_clause_parts.append("u.name ILIKE %s")
            params.append(f"%{name}%")

        # 3. Construir la cláusula WHERE final
        if where_clause_parts:
            # Unimos las condiciones con " AND " y le añadimos " WHERE " al inicio
            where_clause = " WHERE " + " AND ".join(where_clause_parts)
        else:
            where_clause = ""

        cur.execute(count_query + where_clause, params)
        total_row = cur.fetchone()
        total_count = total_row['count'] if total_row else 0

        final_query = base_query + where_clause + " ORDER BY u.name ASC LIMIT %s OFFSET %s"
        params.extend([page_size, offset])
        cur.execute(final_query, params)
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

        total_pages = (total_count + page_size - 1) // page_size if total_count else 0
        cur.close()
        return jsonify({
            'items': users,
            'total_count': total_count,
            'total_pages': total_pages,
            'current_page': page,
            'page_size': page_size
        })

    except Exception as e:
        current_app.logger.error(f"Error fetching users: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500


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