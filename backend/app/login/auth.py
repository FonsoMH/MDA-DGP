from app.db import get_db_cursor
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash 
from ..users.user_common import get_user_by_email, get_role_by_id
from ..utils.responses import success_response, error_response

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('username')
    submitted_password = data.get('password')

    if not email or not submitted_password:
        return error_response(
            message='Se requiere email y contraseña.',
            http_status=400,
            success=False,
        )

    try:
        cursor = get_db_cursor()
        user_record = get_user_by_email(cursor, email)
        role_id = user_record.get('role_id')
        role_record = get_role_by_id(cursor, role_id)
        role_name = role_record.get('role_name')
        cursor.close()
    except Exception as e:
        print(f"Database error during login: {e}")
        return error_response(
            message='Error de servidor. Inténtalo más tarde.',
            http_status=500,
            success=False,
        )
    
    
    if not user_record:
        return error_response(
            message='Credenciales inválidas.',
            http_status=401,
            success=False,
        )
    
    
    stored_hash = user_record.get('password_hash')
    

    if not stored_hash:
         return error_response(
             message='Credenciales inválidas.',
             http_status=401,
             success=False,
         ) 

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

            return success_response(
                message='Inicio de sesión exitoso.',
                http_status=200,
                success=True,
                user=response_user,
            )
        else:
            return error_response(
                message='Credenciales inválidas.',
                http_status=401,
                success=False,
            )
            
    except ValueError as e:
        print(f"Error de verificación de hash (hash malformado): {e}")
        return error_response(
            message='Error interno de autenticación.',
            http_status=500,
            success=False,
        )