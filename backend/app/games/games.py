from flask import current_app
from app.db import get_db_cursor


def get_config_from_db(student_id, game_id):
    cur = get_db_cursor()
    cur.execute(
        """SELECT ranges, num_elements, num_containers, upward, sum
        FROM student_game_configuration 
        WHERE student_id = %s AND game_id = %s;""", (student_id, game_id)
    )

    configuration = cur.fetchone()
    cur.close()

    current_app.logger.info(configuration)

    return configuration

def _get_game_id_by_slug(cur, slug: str):
    cur.execute("SELECT game_id, slug, name FROM games WHERE slug = %s", (slug,))
    row = cur.fetchone()
    return row

def _validate_and_normalize(payload: dict):
    data = {}
    errors = {}

    if 'ranges' in payload:
        try:
            v = int(payload['ranges'])
            if v < 1 or v > 1000:
                errors['ranges'] = 'Debe estar entre 1 y 1000'
            else:
                data['ranges'] = v
        except Exception:
            errors['ranges'] = 'Debe ser un entero'

    if 'num_elements' in payload:
        try:
            v = int(payload['num_elements'])
            if v < 1 or v > 100:
                errors['num_elements'] = 'Debe estar entre 1 y 100'
            else:
                data['num_elements'] = v
        except Exception:
            errors['num_elements'] = 'Debe ser un entero'

    if 'num_containers' in payload:
        try:
            v = int(payload['num_containers'])
            if v < 0 or v > 10:
                errors['num_containers'] = 'Debe estar entre 0 y 10'
            else:
                data['num_containers'] = v
        except Exception:
            errors['num_containers'] = 'Debe ser un entero'

    if 'upward' in payload:
        data['upward'] = bool(payload['upward'])

    if 'sum' in payload:
        data['sum'] = bool(payload['sum'])

    return data, errors

    