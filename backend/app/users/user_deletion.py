from flask import Blueprint, request, jsonify, current_app
from psycopg2 import sql
from ..db import get_db_cursor
from .user_common import commit_or_rollback


users_deletion_bp = Blueprint('users_deletion', __name__, url_prefix='/api')

@users_deletion_bp.route('/users_deletion', methods=['GET'])
def get_users_deletion():
    cur = get_db_cursor()
    try:
        page = request.args.get('page', default=1)
        per_page = request.args.get('per_page', default=10)
        offset = int(request.args.get('offset', default=0))

        if per_page < 1: per_page = 10
        if page < 1: page = 1

        if offset is not None:
            offset = max(0, int(offset))
        else:
            offset = (page - 1) * per_page

        cur.execute("""SELECT COUNT(*) FROM users_deletion""")
        total = cur.fetchone()['count']

        query = """SELECT * FROM users_deletion
                ORDER BY deletion_date DESC
                LIMIT %s OFFSET %s"""
        cur.execute(query, (per_page, offset))
        rows = cur.fetchall()

        return jsonify({
            'items': rows,
            'total_count': total,
            'page': page,
            'per_page': per_page
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching users deletion records: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        cur.close()


    


