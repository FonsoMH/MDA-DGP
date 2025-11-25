from flask import Blueprint, current_app, jsonify, request
from ..db import get_db_cursor, get_db
from .games import get_config_from_db, _get_game_id_by_slug, _validate_and_normalize

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

        return jsonify(config), 200

    except Exception as e:
        current_app.logger.error(f"Error al obtener configuración del juego: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500


@config_bp.get('/students/<int:student_id>/config')
def get_all_configs(student_id: int):
    cur = get_db_cursor()
    try:
        # Join all games with student configuration (if any)
        cur.execute(
            """
            SELECT g.slug, g.name,
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
            result[r['slug']] = {
                'name': r['name'],
                'enabled': True,  # no hay columna enabled; asumimos activo si existe el juego
                'settings': settings,
            }
        return jsonify({
            'student_id': student_id,
            'games': result
        })
    finally:
        cur.close()

@config_bp.put('/students/<int:student_id>/config/<string:slug>')
def update_one_config(student_id: int, slug: str):
    payload = request.get_json(silent=True) or {}
    # Filtrar solo campos permitidos
    filtered = {k: v for k, v in payload.items() if k in ALLOWED_FIELDS}
    data, errors = _validate_and_normalize(filtered)
    if errors:
        return jsonify({'errors': errors}), 400

    cur = get_db_cursor()
    conn = get_db()
    try:
        game = _get_game_id_by_slug(cur, slug)
        if not game:
            return jsonify({'error': 'Juego no encontrado'}), 404
        game_id = game['game_id']

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
        return jsonify({'ok': True, 'student_id': student_id, 'slug': slug, 'settings': merged})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()


