import pytest
import time
from app import create_app
from app.db import get_db_cursor

def test_get_accessibility_default_settings(client):
    response = client.get("/api/accessibility/defaults")
    assert response.status_code == 200

    data = response.get_json()
    expected_defaults = {
        "background_color": "#F7F8FA",
            "foreground_color": "#000000",
            "number_color": "#000000",
            "box_color": "#D9D9D9",
            "icon_position": "izquierda",
            "high_contrast_mode": False,
            "show_numbers_mode": True,
            "font_size": 16
    }

    for key, expected_value in expected_defaults.items():
        assert data[key] == expected_value, f"Expected {key} to be {expected_value}, got {data[key]}"
    print("✅ Test de configuración de accesibilidad por defecto exitoso")


def test_update_accessibility_settings(client, temp_student):
    student_id, _ = temp_student

    new_config = {
        "background_color": "#FFFFFF",
        "foreground_color": "#111111",
        "number_color": "#222222",
        "box_color": "#333333",
        "icon_position": "derecha",
        "high_contrast_mode": True,
        "show_numbers_mode": False,
        "font_size": 18
    }

    response = client.put(f"/api/accessibility/{student_id}", json=new_config)
    assert response.status_code == 200
    data = response.get_json()

    assert data["updated_settings"]["background_color"] == "#FFFFFF"

    # Verificar persistencia en DB
    cur = get_db_cursor()
    cur.execute("SELECT * FROM accessibility_settings WHERE student_id = %s", (student_id,))
    db_record = cur.fetchone()
    cur.close()

    assert db_record["font_size"] == 18
    assert db_record["icon_position"] == "derecha"
    assert db_record["high_contrast_mode"] is True
    assert db_record["show_numbers_mode"] is False
    assert db_record["background_color"] == "#FFFFFF"
    assert db_record["foreground_color"] == "#111111"
    assert db_record["number_color"] == "#222222"
    assert db_record["box_color"] == "#333333"
    print("✅ Test de actualización de configuración de accesibilidad exitoso")


def test_accessibility_independent_between_students(client, temp_student):
    student1_id, _ = temp_student

    # Crear segundo estudiante
    second_email = f"temp_student_2_{int(time.time()*1000)}@app.com"
    response = client.post("/api/students", json={
        "name": "Temp Student 2",
        "email": second_email
    })
    student2_id = response.get_json()["id"]

    # Cambiar solo el del primero
    response = client.put(f"/api/accessibility/{student1_id}", json={"font_size": 22})
    assert response.status_code == 200

    # Verificar que el segundo no cambió
    resp2 = client.get(f"/api/accessibility/{student2_id}")
    assert resp2.status_code == 200
    assert resp2.get_json()["font_size"] != 22

    # Borrar segundo estudiante temporal
    cur = get_db_cursor()
    cur.execute("DELETE FROM users WHERE user_id = %s; COMMIT;", (student2_id,))
    cur.close()
    print("✅ Test de independencia de configuración entre estudiantes exitoso")


def test_invalid_accessibility_data_rejected(client, temp_student):
    student_id, _ = temp_student
    invalid_cases = [
        {"background_color": "azul"},
        {"font_size": 5},
        {"icon_position": "arriba"},
        {"high_contrast_mode": "yes"},
    ]

    for invalid_data in invalid_cases:
        response = client.put(f"/api/accessibility/{student_id}", json=invalid_data)
        assert response.status_code == 400

    # Borrar estudiante temporal
    cur = get_db_cursor()
    cur.execute("DELETE FROM users WHERE user_id = %s; COMMIT;", (student_id,))
    cur.close()
    print("✅ Test de rechazo de datos inválidos exitoso")
