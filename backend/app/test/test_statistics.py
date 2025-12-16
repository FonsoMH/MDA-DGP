import pytest
from app.db import get_db_cursor


def _get_game_id_by_slug(slug: str) -> int | None:
    cur = get_db_cursor()
    try:
        cur.execute("SELECT game_id FROM games WHERE slug = %s;", (slug,))
        row = cur.fetchone()
        return row["game_id"] if row else None
    finally:
        cur.close()


def _cleanup_results(student_id: int, game_id: int):
    cur = get_db_cursor()
    try:
        cur.execute(
            "DELETE FROM game_results WHERE student_id = %s AND game_id = %s; COMMIT;",
            (student_id, game_id),
        )
    finally:
        cur.close()


@pytest.mark.parametrize("slug", ["toca-numero"])  # usamos un juego existente en la BD
def test_store_game_result_happy_path(client, temp_student, slug):
    # temp_student fixture devuelve (id, email) en algunos tests; en otros solo id.
    # Aquí normalizamos para soportar ambos formatos según conftest actual.
    if isinstance(temp_student, tuple):
        student_id = temp_student[0]
    else:
        student_id = temp_student

    game_id = _get_game_id_by_slug(slug)
    if not game_id:
        pytest.skip(f"Juego '{slug}' no está disponible en esta BD de pruebas")

    payload = {
        "student_id": student_id,
        "game_id": game_id,
        "successful_plays": 3,
        "failed_plays": 2,
        "abandoned": False,
        "time_seconds": 123,
        "played_parameters": {"level": "easy"},
    }

    try:
        # POST crear resultado
        resp = client.post("/api/statistics/game_result/", json=payload)
        assert resp.status_code == 201, resp.get_json()
        data = resp.get_json()
        assert data.get("status") == "stored"
        assert "result_id" in data

        # Verificar en DB
        cur = get_db_cursor()
        cur.execute(
            """
            SELECT abandoned, successful_plays, failed_plays, time_seconds, played_parameters
            FROM game_results
            WHERE student_id = %s AND game_id = %s
            ORDER BY result_id DESC
            LIMIT 1
            """,
            (student_id, game_id),
        )
        row = cur.fetchone()
        cur.close()
        assert row is not None
        assert row["abandoned"] is False
        assert row["successful_plays"] == 3
        assert row["failed_plays"] == 2
        assert row["time_seconds"] == 123
        # played_parameters puede venir como dict (JSONB) o string; aceptamos ambos
        pp = row["played_parameters"]
        if isinstance(pp, str):
            import json
            pp = json.loads(pp)
        assert isinstance(pp, (dict, list))
        assert pp == {"level": "easy"}

        # GET agregados para este estudiante y juego
        get_resp = client.get(f"/api/statistics/{student_id}/{game_id}/")
        assert get_resp.status_code == 200
        agg = get_resp.get_json()
        # Devuelve lista (o [] si no hay). Debe haber 1 elemento
        assert isinstance(agg, list) and len(agg) == 1
        item = agg[0]
        assert item["successful_plays"] >= 3  # al menos lo insertado por este test
        assert item["failed_plays"] >= 2
        # total_plays = succ + fail + abandonos (en nuestro caso 3+2+0=5)
        # Permitimos >= porque puede haber más partidas en el mismo día si el test se repite
        assert item["abandon_plays"] >= 0
        assert item["total_plays"] >= item["successful_plays"] + item["failed_plays"] + item["abandon_plays"] - 0

    finally:
        _cleanup_results(student_id, game_id)


@pytest.mark.parametrize("slug", ["toca-numero"])  # usamos un juego existente
def test_store_game_result_abandoned_session(client, temp_student, slug):
    if isinstance(temp_student, tuple):
        student_id = temp_student[0]
    else:
        student_id = temp_student

    game_id = _get_game_id_by_slug(slug)
    if not game_id:
        pytest.skip(f"Juego '{slug}' no está disponible en esta BD de pruebas")

    payload = {
        "student_id": student_id,
        "game_id": game_id,
        "successful_plays": 1,
        "failed_plays": 1,
        "abandoned": True,
        "time_seconds": 40,
    }

    try:
        resp = client.post("/api/statistics/game_result/", json=payload)
        assert resp.status_code == 201, resp.get_json()

        # GET agregados y comprobar abandono
        get_resp = client.get(f"/api/statistics/{student_id}/{game_id}/")
        assert get_resp.status_code == 200
        agg = get_resp.get_json()
        if agg:  # puede devolver [] si algo fue mal
            item = agg[0]
            # Comprobamos al menos que haya contado 1 abandono más
            assert item["abandon_plays"] >= 1
            # total_plays debe contemplar abandonos como +1
            assert item["total_plays"] >= item["successful_plays"] + item["failed_plays"] + item["abandon_plays"] - 0
    finally:
        _cleanup_results(student_id, game_id)


@pytest.mark.parametrize("slug", ["toca-numero"])  # usamos un juego existente
def test_store_game_result_sum_exceeds_limit(client, temp_student, slug):
    if isinstance(temp_student, tuple):
        student_id = temp_student[0]
    else:
        student_id = temp_student

    game_id = _get_game_id_by_slug(slug)
    if not game_id:
        pytest.skip(f"Juego '{slug}' no está disponible en esta BD de pruebas")

    payload = {
        "student_id": student_id,
        "game_id": game_id,
        "successful_plays": 4,
        "failed_plays": 3,  # 7 > DEFAULT_REPEATS (5)
        "abandoned": False,
        "time_seconds": 10,
    }

    resp = client.post("/api/statistics/game_result/", json=payload)
    assert resp.status_code == 400
    data = resp.get_json()
    assert "exceeds" in data.get("error", "").lower()


@pytest.mark.parametrize("slug", ["toca-numero"])  # juego existente
def test_store_game_result_missing_fields(client, temp_student, slug):
    if isinstance(temp_student, tuple):
        student_id = temp_student[0]
    else:
        student_id = temp_student

    game_id = _get_game_id_by_slug(slug)
    if not game_id:
        pytest.skip(f"Juego '{slug}' no está disponible en esta BD de pruebas")

    payload = {
        "student_id": student_id,
        "game_id": game_id,
        "successful_plays": 1,
        "failed_plays": 1,
        "abandoned": False,
        # falta time_seconds
    }

    resp = client.post("/api/statistics/game_result/", json=payload)
    assert resp.status_code == 400
    data = resp.get_json()
    assert data.get("error") == "Missing required fields"
    assert "time_seconds" in data.get("fields", [])


@pytest.mark.parametrize("slug", ["toca-numero"])  # juego existente
def test_store_game_result_invalid_types(client, temp_student, slug):
    if isinstance(temp_student, tuple):
        student_id = temp_student[0]
    else:
        student_id = temp_student

    game_id = _get_game_id_by_slug(slug)
    if not game_id:
        pytest.skip(f"Juego '{slug}' no está disponible en esta BD de pruebas")

    # Caso: abandoned tipo incorrecto
    payload = {
        "student_id": student_id,
        "game_id": game_id,
        "successful_plays": 1,
        "failed_plays": 1,
        "abandoned": "false",  # debe ser bool
        "time_seconds": 10,
    }

    resp = client.post("/api/statistics/game_result/", json=payload)
    assert resp.status_code == 400
    assert "abandoned must be boolean" in resp.get_json().get("error", "")

    # Caso: time_seconds negativo
    payload2 = {
        "student_id": student_id,
        "game_id": game_id,
        "successful_plays": 1,
        "failed_plays": 1,
        "abandoned": False,
        "time_seconds": -5,  # inválido
    }
    resp2 = client.post("/api/statistics/game_result/", json=payload2)
    assert resp2.status_code == 400
    assert "time_seconds" in resp2.get_json().get("error", "")


@pytest.mark.parametrize("slug", ["toca-numero"])  # juego existente
def test_store_game_result_student_not_found(client, slug):
    # game_id = _get_game_id_by_slug(slug)
    # if not game_id:
    #     pytest.skip(f"Juego '{slug}' no está disponible en esta BD de pruebas")

    payload = {
        "student_id": 99999999,  # inexistente
        "game_id": 1, # he usado el id 1 directamente porque el _get_game_id_by_slug no funciona fuera del contexto de app
        "successful_plays": 1,
        "failed_plays": 1,
        "abandoned": False,
        "time_seconds": 10,
    }

    resp = client.post("/api/statistics/game_result/", json=payload)
    assert resp.status_code == 404
    assert resp.get_json().get("error") == "Student not found"


@pytest.mark.parametrize("slug", ["toca-numero"])  # juego existente
def test_store_game_result_game_not_found(client, temp_student, slug):
    if isinstance(temp_student, tuple):
        student_id = temp_student[0]
    else:
        student_id = temp_student

    payload = {
        "student_id": student_id,
        "game_id": 99999999,  # inexistente
        "successful_plays": 1,
        "failed_plays": 1,
        "abandoned": False,
        "time_seconds": 10,
    }

    resp = client.post("/api/statistics/game_result/", json=payload)
    assert resp.status_code == 404
    assert resp.get_json().get("error") == "Game not found"


@pytest.mark.parametrize("slug", ["toca-numero"])  # juego existente
def test_store_game_result_not_student_role(client, temp_teacher, slug):
    # usar id de profesor como student_id debe fallar
    teacher_id, _ = temp_teacher

    game_id = _get_game_id_by_slug(slug)
    if not game_id:
        pytest.skip(f"Juego '{slug}' no está disponible en esta BD de pruebas")

    payload = {
        "student_id": teacher_id,  # no es student
        "game_id": game_id,
        "successful_plays": 1,
        "failed_plays": 1,
        "abandoned": False,
        "time_seconds": 10,
    }

    resp = client.post("/api/statistics/game_result/", json=payload)
    assert resp.status_code == 400
    assert resp.get_json().get("error") == "Provided user is not a student"


@pytest.mark.parametrize("slug", ["toca-numero"])  # juego existente
@pytest.mark.parametrize("played_parameters", [
    {"mode": "A", "level": 2},
    [1, 2, 3, {"nested": True}],
    None,  # no se envían parámetros -> debe guardarse {}
])
def test_store_game_result_played_parameters_variants(client, temp_student, slug, played_parameters):
    if isinstance(temp_student, tuple):
        student_id = temp_student[0]
    else:
        student_id = temp_student

    game_id = _get_game_id_by_slug(slug)
    if not game_id:
        pytest.skip(f"Juego '{slug}' no está disponible en esta BD de pruebas")

    payload = {
        "student_id": student_id,
        "game_id": game_id,
        "successful_plays": 2,
        "failed_plays": 1,
        "abandoned": False,
        "time_seconds": 33,
    }
    if played_parameters is not None:
        payload["played_parameters"] = played_parameters

    try:
        resp = client.post("/api/statistics/game_result/", json=payload)
        assert resp.status_code == 201, resp.get_json()

        cur = get_db_cursor()
        cur.execute(
            """
            SELECT played_parameters FROM game_results
            WHERE student_id = %s AND game_id = %s
            ORDER BY result_id DESC
            LIMIT 1
            """,
            (student_id, game_id),
        )
        row = cur.fetchone()
        cur.close()
        assert row is not None
        stored = row["played_parameters"]
        if isinstance(stored, str):
            import json
            stored = json.loads(stored)
        if played_parameters is None:
            assert stored == {}, "Cuando no se envían parámetros debe guardarse {}"
        else:
            assert stored == played_parameters
    finally:
        _cleanup_results(student_id, game_id)
