from flask import Blueprint, request, jsonify, current_app
from psycopg2 import sql
from ..db import get_db_cursor
from .user_common import commit_or_rollback


users_deletion_bp = Blueprint('users_deletion', __name__, url_prefix='/api')

@users_deletion_bp.route('/users_deletion', methods=['GET'])
def get_users_deletion():
    cur = get_db_cursor()
    cur.execute("""
        SELECT * FROM user_deletion ORDER BY deleted_at DESC
    """)
    rows = cur.fetchall()
    cur.close()
    return jsonify(rows)


