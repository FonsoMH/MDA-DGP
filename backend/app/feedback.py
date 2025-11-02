import random

from flask import Blueprint, request, jsonify
import psycopg2

from .db import get_db

bp = Blueprint('feedback', __name__, url_prefix='/feedback')


def get_feedback_info():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT url, texto 
        FROM multimedia 
        WHERE type = 'fondo' AND feedback IS TRUE;
    """)

    all_feedbacks = cur.fetchall()

    random_feedback = random.choice(all_feedbacks)
    cur.close()

    return random_feedback

@bp.route('/', methods=['GET'])
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