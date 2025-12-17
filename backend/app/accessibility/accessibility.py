from flask import Blueprint, request, jsonify
from app.db import get_db_cursor, get_db
import re
from ..utils.responses import success_response, error_response

accessibility_bp = Blueprint("accessibility", __name__, url_prefix="/api")

# --- Validation ---
def validate_color_hex(color):
    if not isinstance(color, str):
        return False
    # #RRGGBB format
    return bool(re.fullmatch(r"#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?", color))

def validate_icon_position(pos):
    return pos in ("izquierda", "derecha")

def validate_font_size(size):
    return isinstance(size, int) and size > 8

def validate_booleano(val):
    return isinstance(val, bool)

# --- GET ---
@accessibility_bp.route("/accessibility/defaults", methods=["GET"])
def get_default_accessibility():
    cur = get_db_cursor()
    try:
        default_settings = {
            "background_color": "#F7F8FA",
            "foreground_color": "#000000",
            "number_color": "#000000",
            "box_color": "#D9D9D9",
            "icon_position": "izquierda",
            "high_contrast_mode": False,
            "show_numbers_mode": True,
            "font_size": 16
        }

        # Mantener las claves originales y añadir la envoltura estándar
        return success_response(
            message="Configuración de accesibilidad por defecto obtenida correctamente.",
            http_status=200,
            **default_settings,
        )

    except Exception as e:
        return error_response(
            message="Error al obtener configuración por defecto.",
            http_status=500,
            error="Error al obtener configuración por defecto",
        )
    finally:
        cur.close()

@accessibility_bp.route("/accessibility/<int:student_id>", methods=["GET"])
def get_accessibility(student_id):
    cur = get_db_cursor()
    cur.execute("SELECT * FROM accessibility_settings WHERE student_id = %s", (student_id,))
    settings = cur.fetchone()
    cur.close()
    if not settings:
        return error_response(
            message="No se encontró configuración de accesibilidad para el estudiante.",
            http_status=404,
            error="No se encontró configuración",
        )

    # Devolvemos los settings tal cual más los campos estándar
    return success_response(
        message="Configuración de accesibilidad obtenida correctamente.",
        http_status=200,
        **settings,
    )

# --- PUT ---
@accessibility_bp.route("/accessibility/<int:student_id>", methods=["PUT"])
def update_accessibility(student_id):
    data = request.get_json()
    if not data:
        return error_response(
            message="No se recibió ningún dato de configuración de accesibilidad.",
            http_status=400,
            error="No se recibió ningún dato",
        )

    # --- Obtener valores con default ---
    background_color = data.get("background_color", "#D9D9D9")
    foreground_color = data.get("foreground_color", "#000000")
    container_color = data.get("container_color", "#FFFFFF")
    number_color = data.get("number_color", "#000000")
    box_color = data.get("box_color", "#D9D9D9")
    icon_position = data.get("icon_position", "izquierda")
    show_numbers_mode = data.get("show_numbers_mode", True)
    font_size = data.get("font_size", 16)

    # --- Validation ---
    #TODO no se si las validaciones sobran
    errores = []

    if not validate_color_hex(background_color):
        errores.append("background_color inválido " + background_color)
    if not validate_color_hex(foreground_color):
        errores.append("foreground_color inválido " + foreground_color)
    if not validate_color_hex(container_color):
        errores.append("container_color inválido " + container_color)
    if not validate_color_hex(number_color):
        errores.append("number_color inválido " + number_color)
    if not validate_color_hex(box_color):
        errores.append("box_color inválido " + box_color)
    if not validate_icon_position(icon_position):
        errores.append("icon_position inválido")
    if not validate_booleano(show_numbers_mode):
        errores.append("show_numbers_mode debe ser booleano")
    if not validate_font_size(font_size):
        errores.append("font_size debe ser un número mayor a 8")

    if errores:
        return error_response(
            message="Los datos de accesibilidad proporcionados no son válidos.",
            http_status=400,
            errors=errores,
        )

    cur = get_db_cursor()
    db = get_db()

    cur.execute("""
        UPDATE accessibility_settings
        SET background_color = %s,
            foreground_color = %s,
            container_color = %s,
            number_color = %s,
            box_color = %s,
            icon_position = %s,
            show_numbers_mode = %s,
            font_size = %s
        WHERE student_id = %s
    """, (
        background_color,
        foreground_color,
        container_color,
        number_color,
        box_color,
        icon_position,
        show_numbers_mode,
        font_size,
        student_id
    ))

    if cur.rowcount == 0:
        #  No student_id found
        cur.close()
        return error_response(
            message="No existe configuración de accesibilidad para ese estudiante.",
            http_status=404,
            error="No existe configuración para ese student_id",
        )

    db.commit()
    cur.close()


    cur = get_db_cursor()
    cur.execute("SELECT * FROM accessibility_settings WHERE student_id = %s", (student_id,))
    updated_settings = cur.fetchone()
    cur.close()

    return success_response(
        message="Configuración de accesibilidad actualizada correctamente.",
        http_status=200,
        updated_settings=updated_settings,
    )

