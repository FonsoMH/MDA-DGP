import pytest
import time
from app import create_app
from app.db import get_db_cursor
from werkzeug.security import check_password_hash

# # ---------------- Fixtures ----------------
# @pytest.fixture
# def client():
#     app = create_app()
#     app.config["TESTING"] = True
#     with app.test_client() as client:
#         yield client


# @pytest.fixture
# def temp_teacher(client):
#     """Crea un profesor temporal con email único y limpia después"""
#     unique_email = f"temp_teacher_{int(time.time()*1000)}@app.com"
#     payload = {
#         "name": "Temp Teacher",
#         "email": unique_email,
#         "password": "hash123",
#         "assigned_students_ids": []
#     }

#     response = client.post("/api/teacher", json=payload)
#     assert response.status_code == 201, f"Error creando profesor: {response.get_json()}"
#     teacher_id = response.get_json()["id"]
#     print(f"✅ Profesor temporal creado: {teacher_id} ({unique_email})")

#     yield teacher_id, unique_email

#     # Cleanup con contexto de aplicación activo
#     app = create_app()
#     with app.app_context():
#         cur = get_db_cursor()
#         cur.execute("DELETE FROM users WHERE user_id = %s; COMMIT;", (teacher_id,))
#         cur.close()
#         print(f"Profesor temporal eliminado: {teacher_id}")


# ---------------- Tests ----------------
def test_create_teacher(client):
    """Verifica que un profesor se puede crear correctamente"""
    unique_email = f"test_teacher_{int(time.time()*1000)}@app.com"
    payload = {
        "name": "Test Teacher",
        "email": unique_email,
        "password": "pytest_hash",
        "assigned_students_ids": []
    }
    response = client.post("/api/teacher", json=payload)
    assert response.status_code == 201
    teacher_id = response.get_json()["id"]
    print(f"✅ Profesor creado: {teacher_id}")

    # Verificar en DB
    cur = get_db_cursor()
    cur.execute(
        "SELECT name, email, role_id, password_hash FROM users WHERE user_id = %s;",
        (teacher_id,)
    )
    row = cur.fetchone()
    assert row is not None
    assert row["email"] == unique_email
    assert row["role_id"] == 2
    assert row["password_hash"] != ""  # verificamos que hay un hash generado
    print(f"Verificación DB completada para profesor: {teacher_id}")

    # Cleanup
    cur.execute("DELETE FROM users WHERE user_id = %s; COMMIT;", (teacher_id,))
    cur.close()
    print(f"Profesor eliminado: {teacher_id}")


def test_assign_students_to_teacher(temp_teacher):
    """Verifica que los alumnos se asignan a un profesor existente"""
    teacher_id, _ = temp_teacher
    student_ids = [3, 4]

    cur = get_db_cursor()
    # Asignar alumnos al profesor
    cur.execute(
        "UPDATE users SET assigned_teacher_id = %s WHERE user_id = ANY(%s); COMMIT;",
        (teacher_id, student_ids)
    )
    print(f"✅ Alumnos {student_ids} asignados al profesor {teacher_id}")

    # Verificar asignación
    cur.execute(
        "SELECT user_id, assigned_teacher_id FROM users WHERE user_id = ANY(%s);",
        (student_ids,)
    )
    rows = cur.fetchall()
    for r in rows:
        assert r["assigned_teacher_id"] == teacher_id
    print(f"Verificación DB completada para alumnos asignados al profesor {teacher_id}")

    # Limpiar asignación
    cur.execute(
        "UPDATE users SET assigned_teacher_id = NULL WHERE assigned_teacher_id = %s; COMMIT;",
        (teacher_id,)
    )
    cur.close()
    print(f"Asignación de alumnos revertida para el profesor {teacher_id}")


def test_create_teacher_email_exists(client, temp_teacher):
    """Verifica que no se puede crear un profesor con un email existente"""
    _, existing_email = temp_teacher  # usamos el email generado por la fixture

    payload = {
        "name": "Duplicate Email Teacher",
        "email": existing_email,
        "password": "any_password",
        "assigned_students_ids": []
    }

    response = client.post("/api/teacher", json=payload)
    assert response.status_code == 400
    json_data = response.get_json()
    assert "Email already in use." in json_data.get("error", "")
    print("✅ Test de email duplicado exitoso: no se creó el profesor")


def test_update_teacher_basic_fields(client, temp_teacher):
    user_id, _ = temp_teacher
    update_payload = {
        "name": "Updated Teacher",
        "email": "updated_teacher@app.com",
        "password": "new_password_123"
    }
    response = client.put(f"/api/teacher/{user_id}", json=update_payload)
    assert response.status_code == 200
    assert response.get_json()["message"] == "Teacher updated successfully."

    cur = get_db_cursor()
    cur.execute("SELECT name, email, password_hash FROM users WHERE user_id = %s;", (user_id,))
    row = cur.fetchone()
    assert row is not None
    assert row["name"] == "Updated Teacher"
    assert row["email"] == "updated_teacher@app.com"
    assert check_password_hash(row["password_hash"], "new_password_123")
    cur.close()


def test_update_teacher_assign_students(client, temp_teacher):
    user_id, _ = temp_teacher
    payload = {"assigned_students_ids": [3, 4]}

    response = client.put(f"/api/teacher/{user_id}", json=payload)
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
    user_id, _ = temp_teacher

    duplicate_email = f"duplicate_{int(time.time()*1000)}@app.com"

    cur = get_db_cursor()
    cur.execute("""
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES (%s, %s, %s, %s)
        RETURNING user_id;
    """, ('Other User', duplicate_email, 'x', 2))
    other_id = cur.fetchone()["user_id"]
    cur.execute("COMMIT;")
    cur.close()

    # Intentar actualizar el temp_teacher con ese email duplicado
    payload = {"email": duplicate_email}
    response = client.put(f"/api/teacher/{user_id}", json=payload)
    assert response.status_code == 400
    assert "Email already in use" in response.get_json()["error"]
    print("✅ Test de email duplicado exitoso")

    # Cleanup
    cur = get_db_cursor()
    cur.execute("DELETE FROM users WHERE user_id = %s; COMMIT;", (other_id,))
    cur.close()
