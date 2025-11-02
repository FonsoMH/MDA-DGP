from app.db import get_db_cursor

def test_update_admin_basic_fields(client, temp_admin):
    user_id = temp_admin

    update_payload = {
        "name": "Updated Admin",
        "email": "updated_admin@app.com",
        "password_hash": "new_hash_123"
    }

    response = client.put(f"/api/admin/{user_id}", json=update_payload)
    assert response.status_code == 200
    assert response.get_json()["message"] == "Admin updated successfully."

    # Verificar en DB
    cur = get_db_cursor()
    cur.execute("SELECT name, email, password_hash FROM users WHERE user_id = %s;", (user_id,))
    row = cur.fetchone()
    assert row is not None
    assert row["name"] == "Updated Admin"
    assert row["email"] == "updated_admin@app.com"
    assert row["password_hash"] == "new_hash_123"
    cur.close()
