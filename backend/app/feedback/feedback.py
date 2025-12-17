import random
from flask import Blueprint, request, jsonify
import psycopg2
from ..db import get_db
from .feedback_common import get_feedback_info
from ..utils.responses import success_response, error_response

feedback_bp = Blueprint('feedback', __name__, url_prefix='/api')

@feedback_bp.route('/feedback', methods=['GET'])
def get_feedback():
    try:
        random_feedback = get_feedback_info()

        if random_feedback:
            return success_response(
                message="Feedback obtenido correctamente.",
                http_status=200,
                success=True,
                data=random_feedback,
            )
        else:
            return error_response(
                message="No se encontró feedback disponible.",
                http_status=404,
                success=False,
            )

    except Exception as e:
        print(f"Error al obtener feedback: {e}")
        return error_response(
            message="Error interno del servidor al procesar la solicitud.",
            http_status=500,
            success=False,
        )