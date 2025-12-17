from flask import Blueprint, request, jsonify, current_app
from psycopg2 import sql
from ..db import get_db_cursor
from .user_common import get_user_by_id, email_in_use, commit_or_rollback, check_basic_values
from werkzeug.security import generate_password_hash
from ..utils.responses import success_response, error_response

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
        # Mantener el campo "error" para compatibilidad, pero usar el formato estándar
        return error_response(
            message="Nombre, correo electrónico y contraseña son obligatorios.",
            http_status=400,
            error="Name, email, and password are required.",
        )

    cur = get_db_cursor()
    try:
        # Validar email único
        if email_in_use(cur, email):
            return error_response(
                message="El correo electrónico ya está en uso.",
                http_status=400,
                error="Email is already in use.",
            )

        # Obtener role_id del rol "admin" para evitar hardcodeos
        cur.execute("SELECT role_id FROM roles WHERE role_name = %s", ('admin',))
        role_row = cur.fetchone()
        if not role_row:
            return error_response(
                message="No se encontró el rol de administrador en la base de datos.",
                http_status=500,
                error="admin role not found in the database.",
            )
        admin_role_id = role_row['role_id']

        # Hashear password y crear el usuario admin
        password_hash = generate_password_hash(password)

        cur.execute(
            """
            INSERT INTO users (name, email, password_hash, role_id)
            VALUES (%s, %s, %s, %s)
            RETURNING user_id
            """,
            (name, email, password_hash, admin_role_id)
        )

        new_user_id = cur.fetchone()['user_id']

        commit_or_rollback(cur, True)
        return success_response(
            message="Administrador creado correctamente prueba.",
            http_status=201,
            user_id=new_user_id,
        )

    except Exception as e:
        commit_or_rollback(cur, False)
        current_app.logger.error(f"Error creating admin: {e}")
        return error_response(
            message="Ha ocurrido un error interno. Inténtalo de nuevo más tarde.",
            http_status=500,
            error="Internal server error",
        )
    finally:
        cur.close()

# Read all admins
@admin_bp.route('/admins', methods=['GET'])
def get_admins():
    cur = get_db_cursor()
    try:
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 10))
        offset = int(request.args.get('offset', default=0))
        # Normalización básica de parámetros de paginación
        if page_size < 1:
            page_size = 10
        if page < 1:
            page = 1

        if offset is not None:
            offset = max(0, int(offset))
        else:
            offset = (page - 1) * page_size

        cur.execute("SELECT COUNT(*) AS count FROM users WHERE role = %s", ('admin',))
        total_row = cur.fetchone()
        total_count = total_row['count'] if total_row else 0

        cur.execute("SELECT user_id, name, email FROM users WHERE role = %s ORDER BY name ASC LIMIT %s OFFSET %s", ('admin', page_size, offset))
        admins = cur.fetchall()
        admin_list = [{
            'id': admin['user_id'], 
            'name': admin['name'], 
            'email': admin['email'
            ]} for admin in admins
        ]

        total_pages = (total_count + page_size - 1) // page_size if total_count else 0
        
        # Para no romper el frontend, mantenemos la estructura actual y
        # añadimos solo los campos estándar en la raíz.
        return success_response(
            message="Lista de administradores obtenida correctamente.",
            http_status=200,
            items=admin_list,
            total_count=total_count,
            total_pages=total_pages,
            current_page=page,
        )
    
    except Exception as e:
        current_app.logger.error(f"Error fetching admins: {e}")
        return error_response(
            message="Ha ocurrido un error interno al obtener los administradores.",
            http_status=500,
            error="Internal server error",
        )
    finally:
        cur.close()

# Update an admin
@admin_bp.route('/admins/<int:user_id>', methods=['PUT'])
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
            return error_response(
                message="Administrador no encontrado.",
                http_status=404,
                error="Admin not found.",
            )

        fields, values = [], []

        fields, values = check_basic_values(cur, name, email, password_hash, user_id)

        if isinstance(fields, dict) and 'error' in fields:
            # check_basic_values ya devuelve un dict de error y un status code
            error_payload, status_code = fields, values
            # Adaptamos al nuevo formato sin romper la estructura esperada en otros módulos
            return error_response(
                message="El correo electrónico ya está en uso.",
                http_status=status_code,
                **error_payload,
            )

        if fields:
            query = f"UPDATE users SET {', '.join(fields)} WHERE user_id = %s"
            values.append(user_id)
            cur.execute(query, tuple(values))

        commit_or_rollback(cur, True)
        return success_response(
            message="Administrador actualizado correctamente.",
            http_status=200,
        )

    except Exception as e:
        commit_or_rollback(cur, False)
        current_app.logger.error(f"Error updating admin {user_id}: {e}")
        return error_response(
            message="Ha ocurrido un error interno al actualizar el administrador.",
            http_status=500,
            error="Internal server error",
        )
    finally:
        cur.close()

# Delete an admin
@admin_bp.route('/admins/<int:user_id>', methods=['DELETE'])
def delete_admin(user_id):
    cur = get_db_cursor()
    try:
        user = get_user_by_id(cur, user_id)
        if not user:
            return error_response(
                message="Administrador no encontrado.",
                http_status=404,
                error="Admin not found.",
            )
        
        # Check if this is the last admin, and prevent deletion if so
        cur.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        admin_count = cur.fetchone()[0]
        if admin_count <= 1:
            return error_response(
                message="No se puede eliminar el último usuario administrador.",
                http_status=400,
                error="Cannot delete the last admin user.",
            )
        

        cur.execute("DELETE FROM users WHERE user_id = %s", (user_id,))

        commit_or_rollback(cur, True)
        return success_response(
            message="Administrador eliminado correctamente.",
            http_status=200,
        )

    except Exception as e:
        commit_or_rollback(cur, False)
        current_app.logger.error(f"Error deleting admin {user_id}: {e}")
        return error_response(
            message="Ha ocurrido un error interno al eliminar el administrador.",
            http_status=500,
            error="Internal server error",
        )
    finally:
        cur.close()