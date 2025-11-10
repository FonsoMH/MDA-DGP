from app.db import get_db_cursor
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash 
from ..users.user_common import get_user_by_email, get_role_by_id

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('username')
    submitted_password = data.get('password')

    if not email or not submitted_password:
        return jsonify({
            'success': False, 
            'message': 'Se requiere email y contraseña.'
        }), 400

    try:
        cursor = get_db_cursor()
        user_record = get_user_by_email(cursor, email)
        role_id = user_record.get('role_id')
        role_record = get_role_by_id(cursor, role_id)
        role_name = role_record.get('role_name')
        cursor.close()
    except Exception as e:
        print(f"Database error during login: {e}")
        return jsonify({
            'success': False, 
            'message': 'Error de servidor. Inténtalo más tarde.'
        }), 500
    
    
    if not user_record:
        return jsonify({'success': False, 'message': 'Credenciales inválidas.'}), 401
    
    
    stored_hash = user_record.get('password_hash')
    

    if not stored_hash:
         return jsonify({'success': False, 'message': 'Credenciales inválidas.'}), 401 

    submitted_bytes = submitted_password.encode('utf-8')
    stored_bytes = stored_hash.encode('utf-8')
    
    try:
        if check_password_hash(stored_hash, submitted_password):
            
            
            
            response_user = {
                'id': user_record['user_id'], 
                'name': user_record['name'], 
                'email': user_record['email'],
                'role': role_name
            }

            return jsonify({
                'success': True, 
                'message': 'Login successful', 
                'user': response_user
            }), 200
        else:
            return jsonify({'success': False, 'message': 'Credenciales inválidas.'}), 401
            
    except ValueError as e:
        print(f"Error de verificación de hash (hash malformado): {e}")
        return jsonify({'success': False, 'message': 'Error interno de autenticación.'}), 500