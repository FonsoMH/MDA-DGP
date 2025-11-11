from app.db import get_db_cursor
import time

def test_user_deletion(client, temp_admin, temp_student):
    admin_id, admin_email = temp_admin
    student_id, student_email = temp_student

    # Ejecutar DELETE
    response = client.delete(f"/api/users/{student_id}?admin_id={admin_id}")
    assert response.status_code == 200
    data = response.get_json()
    assert "deleted successfully" in data["message"]

    # Verificar el registro de eliminación desde la respuesta
    record = data.get("user_deletion_record")
    assert record is not None
    assert record["delete_admin_id"] == admin_id
    assert record["delete_user_id"] == student_id
    assert record["deleted_user_email"] == student_email
