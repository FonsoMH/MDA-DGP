from flask import Blueprint, request, jsonify, current_app
from ..db import get_db_cursor
from psycopg2 import sql
from werkzeug.security import generate_password_hash
# from .user_common import get_user_by_id, email_in_use, commit_or_rollback, check_basic_values
from ..utils.responses import success_response, error_response

classes_bp = Blueprint('classes', __name__, url_prefix='/api')

# Get all classes
@classes_bp.route('/classes', methods=['GET'])
def get_classes():
    cur = get_db_cursor()
    try:
        cur.execute("SELECT class_id, class_name FROM classes;")
        classes = cur.fetchall()
        classes_list = [{
            'id': row['class_id'], 
            'name': row['class_name'
                        ]} for row in classes]

        # Mantener forma de lista "desnuda" para no romper el frontend actual
        return jsonify(classes_list), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching classes: {e}")
        # Respuesta homogénea de error
        return error_response(
            message="Ha ocurrido un error interno al obtener las clases.",
            http_status=500,
            error="Internal server error",
        )
    finally:
        cur.close()

# Get students by class
@classes_bp.route('/classes/<int:class_id>/students', methods=['GET'])
def get_students_by_class(class_id):
    cur = get_db_cursor()
    try:
        cur.execute("""
            SELECT user_id, name, email
            FROM users
            WHERE class_id = %s
            ORDER BY name ASC
        """, (class_id,))
        students = cur.fetchall()

        students_list = [{
            'id': s['user_id'],
            'name': s['name'],
            'email': s['email']
        } for s in students]

        # Homogeneizar respuesta sin romper los datos usados por el frontend
        return success_response(
            message="Lista de estudiantes de la clase obtenida correctamente.",
            http_status=200,
            class_id=class_id,
            students=students_list,
        )

    except Exception as e:
        current_app.logger.error(f"Error fetching students for class {class_id}: {e}")
        return error_response(
            message="Ha ocurrido un error interno al obtener los estudiantes de la clase.",
            http_status=500,
            error="Internal server error",
        )
    finally:
        cur.close()