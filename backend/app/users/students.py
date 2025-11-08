from flask import Blueprint, request, jsonify, current_app
from ..db import get_db_cursor
from psycopg2 import sql
from werkzeug.security import generate_password_hash
from .user_common import get_user_by_id, email_in_use, commit_or_rollback, check_basic_values

students_bp = Blueprint('students', __name__)

# Implement CRUD operations for students users and other student-related endpoints

# Create a new student
@students_bp.route('/api/students', methods=['POST'])
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

# Get all students
@students_bp.route('/students', methods=['GET'])
def get_students():
    """
    Endpoint que devuelve todos los usuarios con role_id = 1 (estudiantes).
    Ruta: GET /users/students
    """
    
    try:
        cur = get_db_cursor()

        cur = get_db_cursor()
        
        cur.execute("SELECT role_id FROM roles WHERE role_name = 'student';")
        role_record = cur.fetchone()
        
        if not role_record:
            cur.close()
            return jsonify({"error": "Error de configuración: Rol 'student' no encontrado"}), 500
            
        STUDENT_ROLE_ID = role_record['role_id']
        
       
        query = """
        SELECT 
            user_id AS id, 
            name, 
            email,
            role_id as role
        FROM users 
        WHERE role_id = %s;
        """
        
        cur.execute(query, (STUDENT_ROLE_ID,)) 
        

        student_records = cur.fetchall()
        
        
        cur.close()
        
        return jsonify(student_records), 200

    except Exception as e:
        print(f"Error al listar estudiantes: {e}")
        return jsonify({"error": "Error interno del servidor", "details": str(e)}), 500
    
# Update a student
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

# Delete a student
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

# Get students without assigned teacher with pagination
@students_bp.route('/api/students/no_teacher', methods=['GET'])
def get_students_without_teacher():
    cur = None
    try:
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 10))
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

# Get assigned teacher for a student
@students_bp.route('/api/students/<int:user_id>/teacher', methods=['GET'])
def get_teacher_by_student(user_id):
    cur = get_db_cursor()
    try:
        cur.execute("SELECT user_id, name, email, assigned_teacher_id FROM users WHERE user_id = %s", (user_id,))
        student = cur.fetchone()
        if not student:
            return jsonify({'error': 'Student not found.'}), 404

        assigned_teacher_id = student['assigned_teacher_id']
        if not assigned_teacher_id:
            return jsonify({'error': 'Student is not assigned to any teacher.'}), 404

        cur.execute("SELECT user_id, name, email FROM users WHERE user_id = %s", (assigned_teacher_id,))
        teacher = cur.fetchone()
        if not teacher:
            return jsonify({'error': 'Teacher not found.'}), 404

        return jsonify({
            'student': {
                'id': user_id
            },
            'teacher': {
                'id': teacher['user_id'],
                'name': teacher['name'],
                'email': teacher['email']
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching teacher for student {user_id}: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()