import time
import pytest
from app import create_app
from app.db import get_db_cursor

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def temp_admin(client):
    """Crear un admin temporal para pruebas y eliminarlo al finalizar"""
    unique_email = f"temp_admin_{int(time.time()*1000)}@app.com"
    payload = {
        "name": "Temp Admin",
        "email": unique_email,
        "password": "temp"
    }
    response = client.post("/api/admins", json=payload)
    assert response.status_code == 201, f"Fallo al crear admin: {response.get_json()}"
    user_id = response.get_json()["user_id"]
    print(f"✅ Admin temporal creado: {user_id} ({unique_email})")
    yield user_id, unique_email

    cur = get_db_cursor()
    cur.execute("DELETE FROM users WHERE user_id = %s; COMMIT;", (user_id,))
    cur.close()


@pytest.fixture
def temp_teacher(client):
    """Crear un profesor temporal para pruebas y eliminarlo al finalizar"""
    unique_email = f"temp_teacher_{int(time.time()*1000)}@app.com"
    payload = {
        "name": "Temp Teacher",
        "email": unique_email,
        "password": "hash_temp",
        "assigned_students_ids": []
    }
    response = client.post("/api/teachers", json=payload)
    assert response.status_code == 201
    user_id = response.get_json()["id"]
    print(f"✅ Profesor temporal creado: {user_id} ({unique_email})")
    yield user_id, unique_email

    cur = get_db_cursor()
    cur.execute("DELETE FROM users WHERE user_id = %s; COMMIT;", (user_id,))
    cur.close()


@pytest.fixture
def temp_student(client):
    """Crear un estudiante temporal para pruebas"""
    unique_email = f"temp_student_{int(time.time()*1000)}@app.com"
    payload = {
        "name": "Temp Student",
        "email": unique_email,
        "assigned_teacher_id": None
    }
    response = client.post("/api/students", json=payload)
    assert response.status_code == 201, f"Fallo al crear estudiante: {response.get_json()}"
    user_id = response.get_json()["id"]
    print(f"✅ Estudiante temporal creado: {user_id} ({unique_email})")
    yield user_id, unique_email

    cur = get_db_cursor()
    cur.execute("DELETE FROM users WHERE user_id = %s; COMMIT;", (user_id,))
    cur.close()
