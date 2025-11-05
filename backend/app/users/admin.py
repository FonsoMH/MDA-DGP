from flask import Blueprint, request, jsonify, current_app
from psycopg2 import sql
from ..db import get_db_cursor
from .user_common import get_user_by_id, email_in_use, commit_or_rollback, check_basic_values
from werkzeug.security import generate_password_hash

admin_bp = Blueprint('admin', __name__)

#TODO : Poner aquí el create_admin cuando se haga merge de la gestion de admins

@admin_bp.route('/api/admin/<int:user_id>', methods=['PUT'])
def update_admin(user_id):
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()
    password_hash = None

    if password:
        password_hash = generate_password_hash(password)

    cur = get_db_cursor()
    try:
        user = get_user_by_id(cur, user_id)
        if not user:
            return jsonify({'error': 'Admin not found.'}), 404

        fields, values = [], []

        fields, values = check_basic_values(cur, name, email, password_hash, user_id)

        if isinstance(fields, dict) and 'error' in fields:
            return jsonify(fields), values  # values contains the status code in this case

        if fields:
            query = f"UPDATE users SET {', '.join(fields)} WHERE user_id = %s"
            values.append(user_id)
            cur.execute(query, tuple(values))

        commit_or_rollback(cur, True)
        return jsonify({'message': 'Admin updated successfully.'}), 200

    except Exception as e:
        commit_or_rollback(cur, False)
        current_app.logger.error(f"Error updating admin {user_id}: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()


@admin_bp.route('/api/admin/<int:user_id>', methods=['DELETE'])
def delete_admin(user_id):
    cur = get_db_cursor()
    try:
        user = get_user_by_id(cur, user_id)
        if not user:
            return jsonify({'error': 'Admin not found.'}), 404
        
        # Check if this is the last admin, and prevent deletion if so
        cur.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        admin_count = cur.fetchone()[0]
        if admin_count <= 1:
            return jsonify({'error': 'Cannot delete the last admin user.'}), 400
        

        cur.execute("DELETE FROM users WHERE user_id = %s", (user_id,))

        commit_or_rollback(cur, True)
        return jsonify({'message': 'Admin deleted successfully.'}), 200

    except Exception as e:
        commit_or_rollback(cur, False)
        current_app.logger.error(f"Error deleting admin {user_id}: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()