from flask import Blueprint, request, jsonify, current_app
from ..db import get_db_cursor
from psycopg2 import sql
from werkzeug.security import generate_password_hash
from .user_common import get_user_by_id, email_in_use, commit_or_rollback, check_basic_values
from ..utils.responses import success_response, error_response

students_bp = Blueprint('students', __name__, url_prefix='/api')

# Implement CRUD operations for students users and other student-related endpoints

# Create a new student
@students_bp.route('/students', methods=['POST'])
def create_student():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    pictogram_password = (data.get('password') or '').strip()
    assigned_teacher_id = data.get('assigned_teacher')

    password_hash = generate_password_hash(pictogram_password)

    if not name or not email:
        return error_response(
            message='El nombre y el correo electrónico son obligatorios.',
            http_status=400,
            error='Name and email are required.',
        )
    
    cur = get_db_cursor()
    try:
        # Get role_id for 'student'
        cur.execute("SELECT role_id FROM roles WHERE role_name = %s", ('student',))
        role_row = cur.fetchone()
        if not role_row:
            return error_response(
                message='No se encontró el rol de estudiante en la base de datos.',
                http_status=500,
                error='Student role not found in the database.',
            )
        role_id = role_row['role_id']

        # Check for existing email
        cur.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return error_response(
                message='El correo electrónico ya está en uso.',
                http_status=400,
                error='Email already exists.',
            )
        
        # Insert new student
        insert_query = """
            INSERT INTO users (name, email, password_hash, role_id, assigned_teacher_id)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING user_id;
        """
        cur.execute(insert_query, (name, email, password_hash or '', role_id, assigned_teacher_id))
        new_id = cur.fetchone()['user_id']

        # Insert default settings in accessibility_settings
        cur.execute(
            """
            INSERT INTO accessibility_settings (student_id)
            VALUES (%s)
            ON CONFLICT (student_id) DO NOTHING;
            """,
            (new_id,),
        )
        
        # Commit the transaction
        cur.execute("COMMIT;")

        return success_response(
            message='Estudiante creado correctamente.',
            http_status=201,
            id=new_id,
            name=name,
            email=email,
        )
    
    except Exception as e:
        try:
            cur.execute("ROLLBACK;")
        except Exception:
            pass
        current_app.logger.error("Error creating student: %s", e)
        return error_response(
            message='Ha ocurrido un error interno al crear el estudiante.',
            http_status=500,
            error='internal server error',
        )
    finally:
        cur.close()
  
# Get all students
@students_bp.route('/students', methods=['GET'])
def get_students():
    """
    Endpoint que devuelve todos los usuarios con role_id = 1 (estudiantes).
    Ruta: GET /api/students
    """
    
    try:
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 10))
        offset = int(request.args.get('offset', default=0))

        if page_size < 1:
            page_size = 10
        if page < 1:
            page = 1

        if offset is not None:
            offset = max(0, int(offset))
        else:
            offset = (page - 1) * page_size

        cur = get_db_cursor()
        
        cur.execute("SELECT role_id FROM roles WHERE role_name = 'student';")
        role_record = cur.fetchone()
        
        if not role_record:
            cur.close()
            return error_response(
                message="Error de configuración: rol 'student' no encontrado.",
                http_status=500,
                error="Error de configuración: Rol 'student' no encontrado",
            )
            
        STUDENT_ROLE_ID = role_record['role_id']
        
        cur.execute("SELECT COUNT(*) AS count FROM users WHERE role_id = %s;", (STUDENT_ROLE_ID,))
        total_record = cur.fetchone()
        total_count = total_record['count'] if total_record else 0
        
        query = """
        SELECT 
            user_id AS id, 
            name, 
            email,
            role_id as role
        FROM users 
        WHERE role_id = %s
        ORDER BY name ASC
        LIMIT %s OFFSET %s;
        """
        
        cur.execute(query, (STUDENT_ROLE_ID, page_size, offset)) 
        student_records = cur.fetchall()
        
        students = [
            {
                'id': row['id'],
                'name': row['name'],
                'email': row['email'],
                'role': row['role']
            }
            for row in student_records
        ]

        total_pages = (total_count + page_size - 1) // page_size if total_count else 0

        cur.close()

        return success_response(
            message='Lista de estudiantes obtenida correctamente.',
            http_status=200,
            items=students,
            total_count=total_count,
            total_pages=total_pages,
            current_page=page,
        )

    except Exception as e:
        print(f"Error al listar estudiantes: {e}")
        return error_response(
            message='Ha ocurrido un error interno al listar los estudiantes.',
            http_status=500,
            error='Error interno del servidor',
            details=str(e),
        )
    
# Update a student
@students_bp.route('/students/<int:user_id>', methods=['PUT'])
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
            return error_response(
                message='Estudiante no encontrado.',
                http_status=404,
                error='Student not found.',
            )

        fields, values = [], []

        fields, values = check_basic_values(cur, name, email, password_hash, user_id)

        if isinstance(fields, dict) and 'error' in fields:
            error_payload, status_code = fields, values
            return error_response(
                message='El correo electrónico ya está en uso.',
                http_status=status_code,
                **error_payload,
            )
        
        if 'assigned_teacher_id' in data:
            fields.append("assigned_teacher_id = %s")
            values.append(assigned_teacher_id)

        if fields:
            query = f"UPDATE users SET {', '.join(fields)} WHERE user_id = %s"
            values.append(user_id)
            cur.execute(query, tuple(values))

        commit_or_rollback(cur, True)
        return success_response(
            message='Estudiante actualizado correctamente.',
            http_status=200,
        )

    except Exception as e:
        commit_or_rollback(cur, False)
        current_app.logger.error(f"Error updating student {user_id}: {e}")
        return error_response(
            message='Ha ocurrido un error interno al actualizar el estudiante.',
            http_status=500,
            error='Internal server error',
        )
    finally:
        cur.close()

# Delete a student
@students_bp.route('/students/<int:user_id>', methods=['DELETE'])
def delete_student(user_id):
    cur = get_db_cursor()
    try:
        user = get_user_by_id(cur, user_id)
        if not user:
            return error_response(
                message='Estudiante no encontrado.',
                http_status=404,
                error='Student not found.',
            )

        cur.execute("DELETE FROM users WHERE user_id = %s", (user_id,))

        commit_or_rollback(cur, True)
        return success_response(
            message='Estudiante eliminado correctamente.',
            http_status=200,
        )

    except Exception as e:
        commit_or_rollback(cur, False)
        current_app.logger.error(f"Error deleting student {user_id}: {e}")
        return error_response(
            message='Ha ocurrido un error interno al eliminar el estudiante.',
            http_status=500,
            error='Internal server error',
        )
    finally:
        cur.close()

# Get students without assigned teacher with pagination
@students_bp.route('/students/no_teacher', methods=['GET'])
def get_students_without_teacher():
    cur = None
    try:
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 10))
        offset = int(request.args.get('offset', default=0))

        if page_size < 1:
            page_size = 10
        if page < 1:
            page = 1

        if offset is not None:
            offset = max(0, int(offset))
        else:
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

        return success_response(
            message='Lista de estudiantes sin profesor obtenida correctamente.',
            http_status=200,
            items=students,
            total_count=total_count,
            total_pages=total_pages,
            current_page=page,
        )

    except Exception as e:
        return error_response(
            message='Ha ocurrido un error interno al obtener los estudiantes sin profesor.',
            http_status=500,
            error='Internal server error',
            detail=str(e),
        )
    finally:
        if cur:
            try:
                cur.close()
            except Exception:
                pass

# Get assigned teacher for a student
@students_bp.route('/students/<int:user_id>/teacher', methods=['GET'])
def get_teacher_by_student(user_id):
    cur = get_db_cursor()
    try:
        cur.execute("SELECT user_id, name, email, assigned_teacher_id FROM users WHERE user_id = %s", (user_id,))
        student = cur.fetchone()
        if not student:
            return error_response(
                message='Estudiante no encontrado.',
                http_status=404,
                error='Student not found.',
            )

        assigned_teacher_id = student['assigned_teacher_id']
        if not assigned_teacher_id:
            return error_response(
                message='El estudiante no tiene ningún profesor asignado.',
                http_status=404,
                error='Student is not assigned to any teacher.',
            )

        cur.execute("SELECT user_id, name, email FROM users WHERE user_id = %s", (assigned_teacher_id,))
        teacher = cur.fetchone()
        if not teacher:
            return error_response(
                message='Profesor no encontrado.',
                http_status=404,
                error='Teacher not found.',
            )

        return success_response(
            message='Profesor asignado obtenido correctamente.',
            http_status=200,
            student={'id': user_id},
            teacher={
                'id': teacher['user_id'],
                'name': teacher['name'],
                'email': teacher['email'],
            },
        )

    except Exception as e:
        current_app.logger.error(f"Error fetching teacher for student {user_id}: {e}")
        return error_response(
            message='Ha ocurrido un error interno al obtener el profesor del estudiante.',
            http_status=500,
            error='Internal server error',
            detail=str(e),
        )
    finally:
        cur.close()