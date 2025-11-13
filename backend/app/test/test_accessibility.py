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
