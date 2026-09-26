from flask import Blueprint, request, jsonify, current_app
from psycopg2 import sql
from ..db import get_db_cursor
from .user_common import commit_or_rollback


users_deletion_bp = Blueprint('users_deletion', __name__, url_prefix='/api')

@users_deletion_bp.route('/users_deletion', methods=['GET'])
def get_users_deletion():
    cur = get_db_cursor()
    cur.execute("""
        SELECT 
            ud.deletion_id,
            ud.delete_user_id,
            ud.deleted_user_email,
            ud.deleted_user_name,
            ud.deleted_at,
            ud.delete_admin_id,
            a.name AS admin_name  -- Alias 'a' para obtener el nombre del administrador
        FROM 
            user_deletion ud
        LEFT JOIN 
            users a ON ud.delete_admin_id = a.user_id
        ORDER BY 
            ud.deleted_at DESC
    """)
    
    rows = cur.fetchall()
    cur.close()
    return jsonify(rows)

