import random
from flask import Blueprint, request, jsonify
import psycopg2
from ..db import get_db
from .feedback_common import get_feedback_info

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/feedback', methods=['GET'])
def get_feedback():
    try:
        random_feedback = get_feedback_info()

        if random_feedback:
            return jsonify({
                "success": True,
                "data": random_feedback
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "No se encontró feedback disponible."
            }), 404

    except Exception as e:
        print(f"Error al obtener feedback: {e}")
        return jsonify({
            "success": False,
            "message": "Error interno del servidor al procesar la solicitud."
        }), 500