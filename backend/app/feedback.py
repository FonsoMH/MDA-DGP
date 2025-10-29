from flask import Blueprint, Flask, request, jsonify, g
import psycopg2

bp = Blueprint('feedback', __name__, url_prefix='/feedback')

@bp.route('/', methods=['GET'])
def get_feedback():
    result = request.args.get('result','').lower()

    if result not in ('win', 'lose'):
        return jsonify({'error': 'Invalid result parameter'}), 400

    
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT url, texto 
        FROM multimedia 
        WHERE type = 'fondo' AND feedback IS TRUE AND result = %s
        LIMIT 1;
    """, (result,))
    row = cur.fetchone()
    cur.close()

    if row:
        url, texto = row
        return jsonify({'background_url': url, 'texto': texto})
    else:
        return jsonify({
            "background_url": "/static/default_bg.jpg",
            "message": "No se encontró feedback para este resultado."
            })