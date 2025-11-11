from flask import Blueprint, request, jsonify, current_app
from psycopg2 import sql
from ..db import get_db_cursor
from .user_common import commit_or_rollback


users_deletion_bp = Blueprint('users_deletion', __name__, url_prefix='/api')

@users_deletion_bp.route('/users_deletion', methods=['GET'])
def get_users_deletion():
    cur = get_db_cursor()
    cur.execute("""
        SELECT * FROM user_deletion ORDER BY deleted_at DESC
    """)
    rows = cur.fetchall()
    cur.close()
    return jsonify(rows)

@users_deletion_bp.route('/users_deletion/<int:user_id>', methods=['DELETE'])
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
