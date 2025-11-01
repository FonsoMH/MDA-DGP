import pytest
from app import create_app
from app.db import get_db_cursor

# ---------------- Fixtures ----------------
@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def temp_user(client):
    """Crear un usuario temporal para pruebas y eliminarlo al finalizar"""
    payload = {
        "name": "Temp User",
        "email": "temp_user@app.com",
        "password_hash": "hash_temp",
        "assigned_students_ids": []
    }
    response = client.post("/api/teacher", json=payload)
    assert response.status_code == 201
    user_id = response.get_json()["id"]
    print(f" Usuario temporal creado: {user_id}")
    yield user_id

    # Cleanup
    cur = get_db_cursor()
    cur.execute("DELETE FROM users WHERE user_id = %s; COMMIT;", (user_id,))
    cur.close()
    print(f" Usuario temporal eliminado: {user_id}")

# ---------------- Tests ----------------
def test_update_user(client, temp_user):
    user_id = temp_user

    update_payload = {
        "name": "Updated Name",
        "email": "updated_user@app.com",
        "password_hash": "new_hash_123"
    }

    response = client.put(f"/api/user/{user_id}", json=update_payload)
    assert response.status_code == 200
    assert response.get_json()["message"] == "User updated successfully."
    print(f" Usuario {user_id} actualizado correctamente")

    # Verificar en DB
    cur = get_db_cursor()
    cur.execute("SELECT name, email, password_hash FROM users WHERE user_id = %s;", (user_id,))
    row = cur.fetchone()
    assert row is not None
    assert row["name"] == "Updated Name"
    assert row["email"] == "updated_user@app.com"
    assert row["password_hash"] == "new_hash_123"
    cur.close()
    print(f" Verificación DB completada para usuario actualizado {user_id}")
    print(f" Detalles: Name={row['name']}, Email={row['email']}, Password_Hash={row['password_hash']}")


def test_update_user_assign_students(client, temp_user):
    """Verifica que se pueden asignar alumnos a un usuario (profesor)"""
    user_id = temp_user

    # Para el test asumimos que existen alumnos con user_id = 3 y 4
    payload = {
        "assigned_students_ids": [3, 4]
    }

    response = client.put(f"/api/user/{user_id}", json=payload)
    assert response.status_code == 200
    print(f" Alumnos asignados correctamente al usuario {user_id}")

    # Verificar en DB
    cur = get_db_cursor()
    cur.execute("SELECT user_id, assigned_teacher_id FROM users WHERE user_id IN (3, 4);")
    rows = cur.fetchall()
    for row in rows:
        assert row["assigned_teacher_id"] == user_id
    cur.close()
    print(f" Verificación DB: alumnos 3 y 4 ahora asignados al usuario {user_id}")

    # Cleanup 
    cur = get_db_cursor()
    cur.execute("UPDATE users SET assigned_teacher_id = NULL WHERE assigned_teacher_id = %s; COMMIT;", (user_id,))
    cur.close()
    print(f" Asignaciones revertidas para usuario {user_id}")


def test_update_user_email_duplicate(client, temp_user):
    """Verifica que no se permite usar un email duplicado"""
    user_id = temp_user

    # Crear otro usuario temporal con un email que usaremos para generar conflicto
    cur = get_db_cursor()
    cur.execute("""
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ('Other User', 'duplicate@app.com', 'x', 2)
        RETURNING user_id;
    """)
    other_id = cur.fetchone()["user_id"]
    cur.execute("COMMIT;")
    cur.close()

    # Intentar actualizar con el mismo email
    payload = {"email": "duplicate@app.com"}
    response = client.put(f"/api/user/{user_id}", json=payload)
    assert response.status_code == 400
    assert "Email already in use" in response.get_json()["error"]
    print(f" Detección correcta de conflicto de email entre {user_id} y {other_id}")

    # Cleanup
    cur = get_db_cursor()
    cur.execute("DELETE FROM users WHERE user_id = %s; COMMIT;", (other_id,))
    cur.close()
    print(f" Usuario duplicado eliminado: {other_id}")

