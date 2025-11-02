from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from .db import get_db_cursor
from psycopg2 import sql

bp = Blueprint('students', __name__)

@bp.route('/api/students', methods=['POST'])
def create_student():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    pictogram_password = (data.get('pictogram_password') or '').strip()
    assigned_teacher_id = data.get('assigned_teacher_id')

    password_hash = generate_password_hash(pictogram_password)

    if not name or not email:
        return jsonify({'error': 'Name and email are required.'}), 400
    
    cur = get_db_cursor()
    try:
        # Get role_id for 'student'
        cur.execute("SELECT role_id FROM roles WHERE role_name = %s", ('student',))
        role_row = cur.fetchone()
        if not role_row:
            return jsonify({'error': 'Student role not found in the database.'}), 500
        role_id = role_row['role_id']

        # Check for existing email
        cur.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({'error': 'Email already exists.'}), 400
        
        # Insert new student
        insert_query = """
            INSERT INTO users (name, email, password_hash, role_id, assigned_teacher_id)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING user_id;
        """
        cur.execute(insert_query, (name, email, password_hash or '', role_id, assigned_teacher_id))
        new_id = cur.fetchone()['user_id']

        # Insert default settings in accessibility_settings
        cur.execute("""
                    INSERT INTO accessibility_settings (student_id)
                    VALUES (%s)
                    ON CONFLICT (student_id) DO NOTHING;
                    """, (new_id,))
        
        # Commit the transaction
        cur.execute("COMMIT;")

        return jsonify({'id': new_id, 'name': name, 'email': email}), 201
    
    except Exception as e:
        try:
            cur.execute("ROLLBACK;")
        except:
            pass
        current_app.logger.error("Error creating student")
        return jsonify({'error': 'internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()