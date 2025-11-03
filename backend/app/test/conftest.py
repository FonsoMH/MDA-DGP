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
    payload = {
        "name": "Temp Admin",
        "email": "temp_admin@app.com",
        "password_hash": "hash_temp"
    }
    response = client.post("/api/admin", json=payload)
    assert response.status_code == 201
    user_id = response.get_json()["id"]
    yield user_id

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
    payload = {
        "name": "Temp Student",
        "email": "temp_student@app.com",
        "assigned_teacher_id": None
    }
    response = client.post("/api/student", json=payload)
    assert response.status_code == 201
    user_id = response.get_json()["id"]
    yield user_id

    cur = get_db_cursor()
    cur.execute("DELETE FROM users WHERE user_id = %s; COMMIT;", (user_id,))
    cur.close()
