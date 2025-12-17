from app.db import get_db_cursor

def test_create_admin_success(client):
    # Email único por corrida para evitar fallo por ejecuciones repetidas
    import time
    unique_email = f"nuevo_admin_{int(time.time()*1000)}@app.com"

    payload = {
        "name": "Nuevo Admin",
        "email": unique_email,
        "password": "Secreta123"
    }

    resp = client.post("/api/admins", json=payload)
    data = resp.get_json()

    assert resp.status_code == 201
    assert data["message"] == "Admin created successfully."
    assert "user_id" in data and isinstance(data["user_id"], int)

    # Verificar en DB que el rol sea admin
    cur = get_db_cursor()
    cur.execute("SELECT role_id FROM roles WHERE role_name = 'admin';")
    admin_role_id = cur.fetchone()["role_id"]

    cur.execute("SELECT name, email, role_id FROM users WHERE user_id = %s;", (data["user_id"],))
    row = cur.fetchone()
    assert row is not None
    assert row["name"] == "Nuevo Admin"
    assert row["email"] == unique_email
    assert row["role_id"] == admin_role_id

    # Cleanup para idempotencia del test
    cur.execute("DELETE FROM users WHERE user_id = %s; COMMIT;", (data["user_id"],))
    cur.close()

def test_create_admin_duplicate_email(client):
    # Usar un email existente del seed
    payload = {
        "name": "Otro Admin",
        "email": "admin@app.com",
        "password": "OtraSecreta123"
    }

    resp = client.post("/api/admins", json=payload)
    data = resp.get_json()

    assert resp.status_code == 400
    assert "error" in data
    assert data["error"].lower().startswith("email")

def test_update_admin_basic_fields(client, temp_admin):
    user_id, _email = temp_admin

    update_payload = {
        "name": "Updated Admin",
        "email": "updated_admin@app.com",
        "password_hash": "new_hash_123"
    }

    response = client.put(f"/api/admins/{user_id}", json=update_payload)
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
