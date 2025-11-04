from ..db import get_db_cursor
from flask import Blueprint, request, jsonify

get_students = Blueprint('get_students', __name__)

@get_students.route('/api/students', methods=['GET'])
def fetch_students():
    cursor = get_db_cursor()
    query = "SELECT user_id as id, name FROM users WHERE role_id = 1"
    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    return jsonify(results), 200
    # return jsonify({'success': True, 'students': results})