from .db import get_db_cursor
from flask import Blueprint, request, jsonify, current_app

accessibility_settings_bp = Blueprint('accessibility_settings', __name__)
@accessibility_settings_bp.route('/accessibility/<int:student_id>', methods=['GET'])

def get_accessibility_settings(student_id):
    try:
        cur = get_db_cursor()
        cur.execute(
            """SELECT * 
            FROM accessibility_settings 
            WHERE student_id = %s;""",
            (student_id,)
        )

        settings = cur.fetchone()
        cur.close()

        current_app.logger.info(settings)

        if settings:
            return jsonify(settings), 200
        else:
            return jsonify({"error": "Settings not found"}), 404
    except Exception as e:
        current_app.logger.error(f"Error retrieving accessibility settings: {e}")
        return jsonify({"error": "Internal server error"}), 500