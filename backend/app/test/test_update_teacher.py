from app.db import get_db_cursor

def test_update_teacher_basic_fields(client, temp_teacher):
    user_id = temp_teacher
    update_payload = {
        "name": "Updated Teacher",
        "email": "updated_teacher@app.com",
        "password_hash": "new_hash_123"
    }
    response = client.put(f"/api/user/update_teacher/{user_id}", json=update_payload)
    assert response.status_code == 200
    assert response.get_json()["message"] == "Teacher updated successfully."

    cur = get_db_cursor()
    cur.execute("SELECT name, email, password_hash FROM users WHERE user_id = %s;", (user_id,))
    row = cur.fetchone()
    assert row is not None
    assert row["name"] == "Updated Teacher"
    assert row["email"] == "updated_teacher@app.com"
    assert row["password_hash"] == "new_hash_123"
    cur.close()


def test_update_teacher_assign_students(client, temp_teacher):
    user_id = temp_teacher
    payload = {"assigned_students_ids": [3, 4]}

    response = client.put(f"/api/user/update_teacher/{user_id}", json=payload)
    assert response.status_code == 200

    cur = get_db_cursor()
    cur.execute("SELECT assigned_teacher_id FROM users WHERE user_id IN (3, 4);")
    rows = cur.fetchall()
    for row in rows:
        assert row["assigned_teacher_id"] == user_id
    cur.close()

    # Cleanup
    cur = get_db_cursor()
    cur.execute("UPDATE users SET assigned_teacher_id = NULL WHERE assigned_teacher_id = %s; COMMIT;", (user_id,))
    cur.close()


def test_update_teacher_email_duplicate(client, temp_teacher):
    user_id = temp_teacher
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
    response = client.put(f"/api/user/update_teacher/{user_id}", json=payload)
    assert response.status_code == 400
    assert "Email already in use" in response.get_json()["error"]

    cur = get_db_cursor()
    cur.execute("DELETE FROM users WHERE user_id = %s; COMMIT;", (other_id,))
    cur.close()
