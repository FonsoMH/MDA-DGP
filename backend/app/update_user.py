from flask import Blueprint, request, jsonify, current_app
from .db import get_db_cursor
from psycopg2 import sql

user_bp = Blueprint('user', __name__)

@user_bp.route('/api/user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password_hash = (data.get('password_hash') or '').strip()
    assigned_teacher_id = data.get('assigned_teacher_id')
    assigned_students_ids = data.get('assigned_students_ids') or []

    cur = get_db_cursor()
    try:
        # Verificar que el usuario existe en la BD mediante user_id
        cur.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
        user = cur.fetchone()
        if not user:
            return jsonify({'error': 'User not found.'}), 404

        # Construir lista dinámica auxiliares para almacenar los campos del UPDATE posterior
        fields = []
        values = []

        if name:
            fields.append("name = %s")
            values.append(name)

        if email:
            # Verificar que no se repita el correo en la BD para otro usuario
            cur.execute("SELECT user_id FROM users WHERE email = %s AND user_id != %s", (email, user_id))
            if cur.fetchone():
                return jsonify({'error': 'Email already in use by another account.'}), 400
            fields.append("email = %s")
            values.append(email)

        if password_hash:
            fields.append("password_hash = %s")
            values.append(password_hash)

        if assigned_teacher_id is not None:
            fields.append("assigned_teacher_id = %s")
            values.append(assigned_teacher_id)

        # Si la lista de campos no está vacía, procedemos a actualizar el usuario
        if fields:
            update_query = f"UPDATE users SET {', '.join(fields)} WHERE user_id = %s"
            values.append(user_id)
            cur.execute(update_query, tuple(values))

        # Si se pasan estudiantes asignados, los actualizamos
        if assigned_students_ids:
            update_students_query = sql.SQL("""
                UPDATE users
                SET assigned_teacher_id = %s
                WHERE user_id = ANY(%s);
            """)
            cur.execute(update_students_query, (user_id, assigned_students_ids))

        cur.execute("COMMIT;")

        return jsonify({'message': 'User updated successfully.'}), 200

    except Exception as e:
        try:
            cur.execute("ROLLBACK;")
        except:
            pass
        current_app.logger.error(f"Error updating user {user_id}: {e}")
        return jsonify({'error': 'internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()




