from flask import Blueprint, current_app, jsonify, request
from ..db import get_db_cursor, get_db
from .games import get_config_from_db, _validate_and_normalize
from ..utils.responses import success_response, error_response  # nuevo import

config_bp = Blueprint('config_bp', __name__, url_prefix='/api')

# Fallback defaults when no row exists for a student/game
DEFAULTS = {
    'min_value': 0,
    'max_value': 10,
    'num_elements': 5,
    'num_containers': 2,
    'upward': True,
    'sum': True,
}

ALLOWED_FIELDS = {'min_value', 'max_value', 'num_elements', 'num_containers', 'upward', 'sum'}

@config_bp.route('/students/<int:student_id>/config/<int:game_id>', methods=['GET'])
def get_game_config(student_id, game_id):
    try:
        config = get_config_from_db(student_id, game_id)

        # Mantener misma estructura de datos, añadiendo status y message
        return success_response(
            message="Configuración del juego obtenida correctamente.",
            http_status=200,
            **config,
        )

    except Exception as e:
        current_app.logger.error(f"Error al obtener configuración del juego: {e}")
        return error_response(
            message="Ha ocurrido un error interno al obtener la configuración del juego.",
            http_status=500,
            error="Error interno del servidor",
        )


@config_bp.get('/students/<int:student_id>/config')
def get_all_configs(student_id: int):
    cur = get_db_cursor()
    try:
        # Get student permission flag
        cur.execute(
            """
            SELECT student_can_configure
            FROM users
            WHERE user_id = %s
            """,
            (student_id,)
        )
        user_row = cur.fetchone()
        student_can_configure = user_row['student_can_configure'] if user_row else False

        cur.execute(
            """
            SELECT g.game_id, g.name,
                   c.min_value, c.max_value, c.num_elements, c.num_containers, c.upward, c.sum
            FROM games g
            LEFT JOIN student_game_configuration c
              ON c.game_id = g.game_id AND c.student_id = %s
            ORDER BY g.game_id
            """,
            (student_id,)
        )
        rows = cur.fetchall()
        result = {}
        for r in rows:
            settings = {
                'min_value': r['min_value'] if r['min_value'] is not None else DEFAULTS['min_value'],
                'max_value': r['max_value'] if r['max_value'] is not None else DEFAULTS['max_value'],
                'num_elements': r['num_elements'] if r['num_elements'] is not None else DEFAULTS['num_elements'],
                'num_containers': r['num_containers'] if r['num_containers'] is not None else DEFAULTS['num_containers'],
                'upward': r['upward'] if r['upward'] is not None else DEFAULTS['upward'],
                'sum': r['sum'] if r['sum'] is not None else DEFAULTS['sum'],
            }

            result[r['game_id']] = {
                'name': r['name'],
                'enabled': True,
                'settings': settings,
            }

        return success_response(
            message="Configuraciones de juegos obtenidas correctamente.",
            http_status=200,
            student_id=student_id,
            student_can_configure=student_can_configure,
            games=result,
        )
    except Exception as e:
        current_app.logger.error(f"Error al obtener todas las configuraciones de juegos: {e}")
        return error_response(
            message="Ha ocurrido un error interno al obtener las configuraciones de los juegos.",
            http_status=500,
            error="Error interno del servidor",
        )
    finally:
        cur.close()
        
@config_bp.put('/students/<int:student_id>/config/<int:game_id>')
def update_one_config(student_id: int, game_id: int):

    payload = request.get_json(silent=True) or {}

    # Filtrar solo campos permitidos
    filtered = {k: v for k, v in payload.items() if k in ALLOWED_FIELDS}
    data, errors = _validate_and_normalize(filtered)
    if errors:
        return error_response(
            message="Los datos de configuración no son válidos.",
            http_status=400,
            errors=errors,
        )

    cur = get_db_cursor()
    conn = get_db()

    try:

        # Obtener valores previos (si existen) para merge con defaults
        cur.execute(
            """
            SELECT min_value, max_value, num_elements, num_containers, upward, sum
            FROM student_game_configuration
            WHERE student_id = %s AND game_id = %s
            """,
            (student_id, game_id)
        )
        prev = cur.fetchone() or {}

        
        merged = {
            'min_value': prev.get('min_value') if prev.get('min_value') is not None else DEFAULTS['min_value'],
            'max_value': prev.get('max_value') if prev.get('max_value') is not None else DEFAULTS['max_value'],
            'num_elements': prev.get('num_elements') if prev.get('num_elements') is not None else DEFAULTS['num_elements'],
            'num_containers': prev.get('num_containers') if prev.get('num_containers') is not None else DEFAULTS['num_containers'],
            'upward': prev.get('upward') if prev.get('upward') is not None else DEFAULTS['upward'],
            'sum': prev.get('sum') if prev.get('sum') is not None else DEFAULTS['sum'],
        }
        merged.update(data)

        # UPSERT
        cur.execute(
            """
            INSERT INTO student_game_configuration (student_id, game_id, min_value, max_value, num_elements, num_containers, upward, sum)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (student_id, game_id)
            DO UPDATE SET
              min_value = EXCLUDED.min_value,
              max_value = EXCLUDED.max_value,
              num_elements = EXCLUDED.num_elements,
              num_containers = EXCLUDED.num_containers,
              upward = EXCLUDED.upward,
              sum = EXCLUDED.sum
            """,
            (
                student_id,
                game_id,
                merged['min_value'],
                merged['max_value'],
                merged['num_elements'],
                merged['num_containers'],
                merged['upward'],
                merged['sum'],
            )
        )

        conn.commit()
        return success_response(
            message="Configuración del juego actualizada correctamente.",
            http_status=200,
            ok=True,
            student_id=student_id,
            game_id=game_id,
            settings=merged,
        )

    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error al actualizar configuración del juego: {e}")
        return error_response(
            message="Ha ocurrido un error interno al actualizar la configuración del juego.",
            http_status=500,
            error="Error interno del servidor",
        )

    finally:
        cur.close()

@config_bp.put('/students/<int:student_id>/config/permission')
def update_student_permission(student_id: int):
    payload = request.get_json(silent=True) or {}
    
    if 'student_can_configure' not in payload:
        return error_response(
            message="Falta el campo student_can_configure en la petición.",
            http_status=400,
            error="Campo requerido ausente",
        )
    
    student_can_configure = payload.get('student_can_configure')
    
    if not isinstance(student_can_configure, bool):
        return error_response(
            message="El campo student_can_configure debe ser un valor booleano.",
            http_status=400,
            error="Tipo de dato inválido",
        )
    
    cur = get_db_cursor()
    conn = get_db()
    
    try:
        cur.execute(
            """
            UPDATE users
            SET student_can_configure = %s
            WHERE user_id = %s
            """,
            (student_can_configure, student_id)
        )
        
        if cur.rowcount == 0:
            return error_response(
                message="No se ha encontrado el estudiante especificado.",
                http_status=404,
                error="Estudiante no encontrado",
            )
        
        conn.commit()
        
        return success_response(
            message="Permisos de configuración del estudiante actualizados correctamente.",
            http_status=200,
            ok=True,
            student_id=student_id,
            student_can_configure=student_can_configure,
        )
        
    except Exception as e:
        conn.rollback()
        current_app.logger.error(f"Error updating student permission: {e}")
        return error_response(
            message="Ha ocurrido un error interno al actualizar los permisos del estudiante.",
            http_status=500,
            error="Error interno del servidor",
        )
    finally:
        cur.close()

@config_bp.get('/students/<int:student_id>/config/permission')
def get_student_permission(student_id: int):
    cur = get_db_cursor()
    try:
        cur.execute(
            """
            SELECT student_can_configure
            FROM users
            WHERE user_id = %s
            """,
            (student_id,)
        )
        user_row = cur.fetchone()
        if not user_row:
            return error_response(
                message="No se ha encontrado el estudiante especificado.",
                http_status=404,
                error="Estudiante no encontrado",
            )
        
        student_can_configure = user_row['student_can_configure']
        
        return success_response(
            message="Permisos de configuración del estudiante obtenidos correctamente.",
            http_status=200,
            student_id=student_id,
            student_can_configure=student_can_configure,
        )
    except Exception as e:
        current_app.logger.error(f"Error fetching student permission: {e}")
        return error_response(
            message="Ha ocurrido un error interno al obtener los permisos del estudiante.",
            http_status=500,
            error="Error interno del servidor",
        )
    finally:
        cur.close()

