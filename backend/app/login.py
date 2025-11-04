from .db import get_db_cursor
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash

# TODO arreglar rutas
teacher_login_bp = Blueprint('teacher_login', __name__)
student_login_bp = Blueprint('student_login', __name__)

@teacher_login_bp.route('/api/login/teacher', methods=['POST'])

def teacher_login():
    
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400
    
    cursor = get_db_cursor()
    query = "SELECT user_id, name FROM users WHERE email = %s AND password_hash = %s"
    cursor.execute(query, (email, password))
    result = cursor.fetchone()
    cursor.close()

    if result and 'user_id' in result:
        return jsonify({'success': True, 'message': 'Login successful', 'user': {'user_id': result['user_id'], 'name': result['name']}})
    else:
        return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401


@student_login_bp.route('/api/login/student', methods=['POST'])

def student_login():
    data = request.get_json()
    id = data.get('id')
    password = data.get('password')

    if not id or not password:
        return jsonify({'success': False, 'message': 'Id and password are required.'}), 400

    cursor = get_db_cursor()
    query = "SELECT name , email FROM users WHERE user_id = %s AND password_hash = %s"
    cursor.execute(query, (id, password))
    result = cursor.fetchone()
    cursor.close()

    if result and 'user_id' in result:
        return jsonify({'success': True, 'message': 'Login successful', 'user': {'user_id': result['user_id'], 'name': result['name'] , 'email': result['email']}})
    else:
        return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401