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
def temp_teacher(client):
    """Crea un profesor temporal y limpia después"""
    payload = {
        "name": "Temp Teacher",
        "email": "temp_teacher@app.com",
        "password_hash": "hash123",
        "assigned_students_ids": []
    }
    response = client.post("/api/teacher", json=payload)
    assert response.status_code == 201
    teacher_id = response.get_json()["id"]
    print(f"✅ Profesor temporal creado: {teacher_id}")
    yield teacher_id
    # Cleanup
    cur = get_db_cursor()
    cur.execute("DELETE FROM users WHERE user_id = %s; COMMIT;", (teacher_id,))
    cur.close()
    print(f" Profesor temporal eliminado: {teacher_id}")

# ---------------- Tests ----------------
def test_create_teacher(client):
    """Verifica que un profesor se puede crear correctamente"""
    payload = {
        "name": "Test Teacher",
        "email": "test_teacher@app.com",
        "password_hash": "pytest_hash",
        "assigned_students_ids": []
    }
    response = client.post("/api/teacher", json=payload)
    assert response.status_code == 201
    teacher_id = response.get_json()["id"]
    print(f"✅ Profesor creado: {teacher_id}")

    # Verificar en DB
    cur = get_db_cursor()
    cur.execute("SELECT name, email, role_id FROM users WHERE user_id = %s;", (teacher_id,))
    row = cur.fetchone()
    assert row is not None
    assert row["email"] == "test_teacher@app.com"
    assert row["role_id"] == 2
    print(f" Verificación DB completada para profesor: {teacher_id}")

    # Cleanup
    cur.execute("DELETE FROM users WHERE user_id = %s; COMMIT;", (teacher_id,))
    cur.close()
    print(f" Profesor eliminado: {teacher_id}")

def test_assign_students_to_teacher(temp_teacher):
    """Verifica que los alumnos se asignan a un profesor existente"""
    teacher_id = temp_teacher
    student_ids = [3, 4]

    cur = get_db_cursor()
    # Asignar alumnos al profesor
    cur.execute("UPDATE users SET assigned_teacher_id = %s WHERE user_id = ANY(%s); COMMIT;", (teacher_id, student_ids))
    print(f"✅ Alumnos {student_ids} asignados al profesor {teacher_id}")

    # Verificar asignación
    cur.execute("SELECT user_id, assigned_teacher_id FROM users WHERE user_id = ANY(%s);", (student_ids,))
    rows = cur.fetchall()
    for r in rows:
        assert r["assigned_teacher_id"] == teacher_id
    print(f" Verificación DB completada para alumnos asignados al profesor {teacher_id}")

    # Limpiar asignación
    cur.execute("UPDATE users SET assigned_teacher_id = NULL WHERE assigned_teacher_id = %s; COMMIT;", (teacher_id,))
    cur.close()
    print(f" Asignación de alumnos revertida para el profesor {teacher_id}")
