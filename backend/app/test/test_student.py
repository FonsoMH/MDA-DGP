from app.db import get_db_cursor

def test_update_student_basic_fields(client, temp_student):
    user_id = temp_student
    update_payload = {
        "name": "Updated Student",
        "email": "updated_student@app.com",
        "assigned_teacher_id": None
    }

    response = client.put(f"/api/students/{user_id}", json=update_payload)
    assert response.status_code == 200
    assert response.get_json()["message"] == "Student updated successfully."

    cur = get_db_cursor()
    cur.execute("SELECT name, email, assigned_teacher_id FROM users WHERE user_id = %s;", (user_id,))
    row = cur.fetchone()
    assert row is not None
    assert row["name"] == "Updated Student"
    assert row["email"] == "updated_student@app.com"
    assert row["assigned_teacher_id"] is None
    cur.close()


def test_update_student_email_duplicate(client, temp_student):
    user_id = temp_student
    cur = get_db_cursor()
    cur.execute("""
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ('Other User', 'duplicate@app.com', 'x', 2)
        RETURNING user_id;
    """)
    other_id = cur.fetchone()["user_id"]
    cur.execute("COMMIT;")
    cur.close()

    payload = {"email": "duplicate@app.com"}
    response = client.put(f"/api/students/{user_id}", json=payload)
    assert response.status_code == 400
    assert "Email already in use" in response.get_json()["error"]

    cur = get_db_cursor()
    cur.execute("DELETE FROM users WHERE user_id = %s; COMMIT;", (other_id,))
    cur.close()


def test_get_student_data(client, temp_student):
    """Recuperación de datos de un estudiante existente."""
    user_id, unique_email = temp_student

    response = client.get(f"/api/students/{user_id}")
    assert response.status_code == 200
    data = response.get_json()

    assert data is not None
    assert data["id"] == user_id
    assert data["name"] == "Temp Student"
    assert data["email"] == unique_email

def test_update_student_permission_admin_only(client, temp_student, temp_teacher):
    """Verifica que solo un Admin puede editar los datos de un estudiante."""
    student_id, _ = temp_student
    teacher_id, _ = temp_teacher
    
    update_payload = {"name": "Unauthorized Update"}
    response = client.put(f"/api/students/{student_id}?acting_user_id={teacher_id}", json=update_payload)
    assert response.status_code == 403
    assert "permission denied" in response.get_json()["error"].lower()

    cur = get_db_cursor()
    cur.execute("SELECT name FROM users WHERE user_id = %s;", (student_id,))
    row = cur.fetchone()
    assert row is not None
    assert row["name"] == "Temp Student" 
    cur.close()


def test_update_student_by_admin(client, temp_student, temp_admin):
    """Verifica que un Admin SÍ puede editar los datos de un estudiante."""
    student_id, _ = temp_student
    admin_id, _ = temp_admin

    update_payload = {"name": "Updated by Admin"}
    
    response = client.put(f"/api/students/{student_id}?acting_user_id={admin_id}", json=update_payload)
    assert response.status_code == 200
    assert response.get_json()["message"] == "Student updated successfully."

    cur = get_db_cursor()
    cur.execute("SELECT name FROM users WHERE user_id = %s;", (student_id,))
    row = cur.fetchone()
    assert row is not None
    assert row["name"] == "Updated by Admin"
    cur.close()