from app.db import get_db_cursor

def test_update_student_basic_fields(client, temp_student):
    user_id = temp_student[0]
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
    user_id = temp_student[0]
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

def test_correct_persistance(client):
    fake_id = 999999
    payload = {"name": "Ghost Student"}

    response = client.put(f"/api/students/{fake_id}", json=payload)
    assert response.status_code == 404
    assert "Student not found" in response.get_json()["error"]
