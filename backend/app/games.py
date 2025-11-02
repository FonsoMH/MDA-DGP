from flask import jsonify, current_app, Blueprint
from app.db import get_db_cursor
import sys
bp = Blueprint('games', __name__, url_prefix='/games')

def get_config_from_db(student_id, game_id):
    cur = get_db_cursor()
    cur.execute(
        """SELECT ranges, num_elements, num_containers, upward, sum
        FROM student_game_configuration 
        WHERE student_id = %s AND game_id = %s;""", (student_id, game_id)
    )

    configuration = cur.fetchone()
    cur.close()

    current_app.logger.info(configuration)

    return configuration

@bp.route('/students/<int:student_id>/config/<int:game_id>', methods=['GET'])
def get_game_config(student_id, game_id):
    try:
        config = get_config_from_db(student_id, game_id)

        return jsonify(config), 200

    except Exception as e:
        current_app.logger.error(f"Error al obtener configuración del juego: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500
    