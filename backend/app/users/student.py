from flask import Blueprint, jsonify
from app.db import get_db_cursor


bp = Blueprint('students', __name__, url_prefix='/students')

@bp.route('/', methods=['GET'])
def get_students():
    """
    Endpoint que devuelve todos los usuarios con role_id = 1 (estudiantes).
    Ruta: GET /users/students
    """
    
    try:
        cur = get_db_cursor()

        cur = get_db_cursor()
        
        cur.execute("SELECT role_id FROM roles WHERE role_name = 'student';")
        role_record = cur.fetchone()
        
        if not role_record:
            cur.close()
            return jsonify({"error": "Error de configuración: Rol 'student' no encontrado"}), 500
            
        STUDENT_ROLE_ID = role_record['role_id']
        
       
        query = """
        SELECT 
            user_id AS id, 
            name, 
            email,
            role_id as role
        FROM users 
        WHERE role_id = %s;
        """
        
        cur.execute(query, (STUDENT_ROLE_ID,)) 
        

        student_records = cur.fetchall()
        
        
        cur.close()
        
        return jsonify(student_records), 200

    except Exception as e:
        print(f"Error al listar estudiantes: {e}")
        return jsonify({"error": "Error interno del servidor", "details": str(e)}), 500
