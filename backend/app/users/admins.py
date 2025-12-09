from flask import Blueprint, request, jsonify, current_app
from psycopg2 import sql
from ..db import get_db_cursor
from .user_common import get_user_by_id, email_in_use, commit_or_rollback, check_basic_values
from werkzeug.security import generate_password_hash

admin_bp = Blueprint('admins', __name__, url_prefix='/api')

# Implement CRUD operations for admin users

# Create a new admin
@admin_bp.route('/admins', methods=['POST'])
def create_admin():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required.'}), 400

    cur = get_db_cursor()
    try:
        if email_in_use(cur, email):
            return jsonify({'error': 'Email is already in use.'}), 400

        password_hash = generate_password_hash(password)

        cur.execute("""
            INSERT INTO users (name, email, password_hash, role_id)
            VALUES (%s, %s, %s, %s)
            RETURNING user_id
        """, (name, email, password_hash, '3'))

        new_user_id = cur.fetchone()['user_id']

        commit_or_rollback(cur, True)
        return jsonify({'message': 'Admin created successfully.', 'user_id': new_user_id}), 201

    except Exception as e:
        commit_or_rollback(cur, False)
        current_app.logger.error(f"Error creating admin: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()

# Read all admins
@admin_bp.route('/admins', methods=['GET'])
def get_admins():
    cur = get_db_cursor()
    try:
        cur.execute("SELECT user_id, name, email FROM users WHERE role = %s", ('admin',))
        admins = cur.fetchall()
        admin_list = [{'id': admin['user_id'], 'name': admin['name'], 'email': admin['email']} for admin in admins]
        return jsonify(admin_list), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching admins: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()

# Update an admin
@admin_bp.route('/admins/<int:user_id>', methods=['PUT', 'PATCH'])
def update_admin(user_id):
    requester_role = request.args.get('requester_role')

    if requester_role != 'admin':
        return jsonify({'error': 'Only admins can update admin users.'}), 403

    data = request.get_json() or {}
    name = data.get('name').strip() if 'name' in data and data.get('name') else None
    email = data.get('email').strip().lower() if 'email' in data and data.get('email') else None
    password = data.get('password').strip() if 'password' in data and data.get('password') else None
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
            return jsonify(fields), fields  # values contains the status code in this case

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

# Delete an admin
@admin_bp.route('/admins/<int:user_id>', methods=['DELETE'])
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