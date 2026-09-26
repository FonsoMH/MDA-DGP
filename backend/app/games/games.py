from flask import current_app
from app.db import get_db_cursor


def get_config_from_db(student_id, game_id):
    cur = get_db_cursor()
    cur.execute(
        """SELECT min_value, max_value, num_elements, num_containers, upward, sum
        FROM student_game_configuration 
        WHERE student_id = %s AND game_id = %s;""", (student_id, game_id)
    )

    configuration = cur.fetchone()
    cur.close()

    current_app.logger.info(configuration)

    return configuration

def _validate_and_normalize(payload: dict):
    data = {}
    errors = {}

    if 'min_value' in payload:
        try:
            v = int(payload['min_value'])
            if v < 0 or v > 1000:
                errors['min_value'] = 'Debe estar entre 0 y 1000'
            else:
                data['min_value'] = v
        except Exception:
            errors['min_value'] = 'Debe ser un entero'

    if 'max_value' in payload:
        try:
            v = int(payload['max_value'])
            if v < 0 or v > 1000:
                errors['max_value'] = 'Debe estar entre 0 y 1000'
            else:
                data['max_value'] = v
        except Exception:
            errors['max_value'] = 'Debe ser un entero'

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

    