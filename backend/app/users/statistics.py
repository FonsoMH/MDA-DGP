from flask import Blueprint, request, jsonify, current_app, Response
from datetime import datetime, timedelta, time
from ..db import get_db_cursor
import json
import io
import csv

statistics_bp = Blueprint('statistics', __name__, url_prefix='/api')

# Default number of rounds per session (must stay in sync with frontend DEFAULT_REPEATS)
DEFAULT_REPEATS = 5


def _parse_iso_datetime(value: str):
    """Parse ISO date/time string. Accepts 'YYYY-MM-DD' or ISO with 'Z'. Returns datetime or raises ValueError."""
    s = (value or '').strip()
    if not s:
        raise ValueError('empty')
    # Handle Zulu time
    if s.endswith('Z'):
        s = s[:-1] + '+00:00'
    try:
        return datetime.fromisoformat(s)
    except Exception:
        # Try plain date
        return datetime.strptime(s, '%Y-%m-%d')


@statistics_bp.route('/statistics/<int:student_id>/<int:game_id>/', methods=['GET'])
def get_student_game_statistics(student_id: int, game_id: int):
    cur = get_db_cursor()
    try:
        #Validate student exists
        cur.execute("SELECT user_id FROM users WHERE user_id = %s", (student_id,))
        user_row = cur.fetchone()
        if not user_row:
            return jsonify({'error': 'Student not found.'}), 404

        #Validate game exists
        cur.execute("SELECT game_id FROM games WHERE game_id = %s", (game_id,))
        game_row = cur.fetchone()
        if not game_row:
            return jsonify({'error': 'Game not found.'}), 404

        #Parse optional dates (echo back as received)
        initial_date_str = request.args.get('initial_date')
        final_date_str = request.args.get('final_date')

        initial_dt = None
        final_dt = None
        try:
            if initial_date_str:
                initial_dt = _parse_iso_datetime(initial_date_str)
            if final_date_str:
                final_dt = _parse_iso_datetime(final_date_str)
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use ISO date or datetime.'}), 400

        if initial_dt and final_dt and initial_dt > final_dt:
            return jsonify({'error': 'initial_date must be before or equal to final_date.'}), 400

        #Buildparameters
        where = ["student_id = %s", "game_id = %s"]
        params = [student_id, game_id]

        if initial_dt:
            where.append("played_at >= %s")
            params.append(initial_dt)
        if final_dt:
            is_midnight = final_dt.time() == time(0,0,0)

            if is_midnight:
                # Interpretar como final de día completo
                inclusive_final = final_dt + timedelta(days=1)
                where.append("played_at < %s")
                params.append(inclusive_final)
            else:
                where.append("played_at <= %s")
                params.append(final_dt)

        where_sql = " AND ".join(where)

        #Aggregates
        agg_sql = f"""
            SELECT
                game_id,
                COALESCE(SUM(successful_plays), 0) AS successful_plays,
                COALESCE(SUM(failed_plays), 0)     AS failed_plays,
                COALESCE(SUM(CASE WHEN abandoned THEN 1 ELSE 0 END), 0) AS abandon_plays,
                COALESCE(SUM(successful_plays + failed_plays + CASE WHEN abandoned THEN 1 ELSE 0 END), 0) AS total_plays
            FROM game_results
            WHERE {where_sql}
            GROUP BY game_id
        """
        cur.execute(agg_sql, params)
        agg_row = cur.fetchone()

        if not agg_row:
            # No results for that filter – return empty list
            return jsonify([]), 200

        #Times per day
        times_sql = f"""
            SELECT
                DATE(played_at) AS day,
                AVG(time_seconds)::NUMERIC(10,2) AS average_time
            FROM game_results
            WHERE {where_sql}
            GROUP BY DATE(played_at)
            ORDER BY DATE(played_at) ASC
        """
        cur.execute(times_sql, params)
        times_rows = cur.fetchall() or []

        times = [
            {
                'average_time': float(r['average_time']),
                'date': r['day'].isoformat(),
            }
            for r in times_rows
        ]

        payload = {
            'game_id': agg_row['game_id'],
            'total_plays': int(agg_row['total_plays']),
            'successful_plays': int(agg_row['successful_plays']),
            'failed_plays': int(agg_row['failed_plays']),
            'abandon_plays': int(agg_row['abandon_plays']),
            'times': times,
            'initial_date': initial_date_str if initial_date_str else None,
            'final_date': final_date_str if final_date_str else None,
        }

        return jsonify(payload), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching statistics for student {student_id}, game {game_id}: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()


@statistics_bp.route('/statistics/<int:student_id>', methods=['GET'])
def get_student_all_game_statistics(student_id: int):
    cur = get_db_cursor()
    try:
        #Validate student exists
        cur.execute("SELECT user_id FROM users WHERE user_id = %s", (student_id,))
        user_row = cur.fetchone()
        if not user_row:
            return jsonify({'error': 'Student not found.'}), 404
        
        #Parse optional dates (echo back as received)
        initial_date_str = request.args.get('initial_date')
        final_date_str = request.args.get('final_date')

        initial_dt = None
        final_dt = None
        try:
            if initial_date_str:
                initial_dt = _parse_iso_datetime(initial_date_str)
            if final_date_str:
                final_dt = _parse_iso_datetime(final_date_str)
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use ISO date or datetime.'}), 400

        if initial_dt and final_dt and initial_dt > final_dt:
            return jsonify({'error': 'initial_date must be before or equal to final_date.'}), 400

        #Buildparameters
        where = ["student_id = %s"]
        params = [student_id]

        if initial_dt:
            where.append("played_at >= %s")
            params.append(initial_dt)
        if final_dt:
            is_midnight = final_dt.time() == time(0,0,0)

            if is_midnight:
                # Interpretar como final de día completo
                inclusive_final = final_dt + timedelta(days=1)
                where.append("played_at < %s")
                params.append(inclusive_final)
            else:
                where.append("played_at <= %s")
                params.append(final_dt)

        where_sql = " AND ".join(where)

        #Aggregates
        agg_sql = f"""
            SELECT
                game_id,
                COALESCE(SUM(successful_plays), 0) AS successful_plays,
                COALESCE(SUM(failed_plays), 0)     AS failed_plays,
                COALESCE(SUM(CASE WHEN abandoned THEN 1 ELSE 0 END), 0) AS abandon_plays,
                COALESCE(SUM(successful_plays + failed_plays + CASE WHEN abandoned THEN 1 ELSE 0 END), 0) AS total_plays
            FROM game_results
            WHERE {where_sql}
            GROUP BY game_id
        """
        cur.execute(agg_sql, tuple(params))
        agg_row = cur.fetchone()

        if not agg_row:
            # No results for that filter – return empty list
            return jsonify([]), 200

        #Times per day
        times_sql = f"""
            SELECT
                DATE(played_at) AS day,
                AVG(time_seconds)::NUMERIC(10,2) AS average_time
            FROM game_results
            WHERE {where_sql}
            GROUP BY DATE(played_at)
            ORDER BY DATE(played_at) ASC
        """
        cur.execute(times_sql, tuple(params))
        times_rows = cur.fetchall() or []

        times = [
            {
                'average_time': float(r['average_time']),
                'date': r['day'].isoformat(),
            }
            for r in times_rows
        ]

        payload = {
            'game_id': agg_row['game_id'],
            'total_plays': int(agg_row['total_plays']),
            'successful_plays': int(agg_row['successful_plays']),
            'failed_plays': int(agg_row['failed_plays']),
            'abandon_plays': int(agg_row['abandon_plays']),
            'times': times,
            'initial_date': initial_date_str if initial_date_str else None,
            'final_date': final_date_str if final_date_str else None,
        }

        return jsonify(payload), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching statistics for student {student_id}, game {game_id}: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()


@statistics_bp.route('/statistics/game_result/', methods=['POST'])
def create_game_result():
    """Persist a finished (or abandoned) game session result.

    Expected JSON body:
    {
      "student_id": int,
      "game_id": int,
      "successful_plays": int,
      "failed_plays": int,
      "abandoned": bool,
      "time_seconds": int,            # total elapsed seconds for the session
    }

    Rules:
      - successful_plays + failed_plays <= DEFAULT_REPEATS
      - If abandoned == False -> sum SHOULD equal DEFAULT_REPEATS (soft check)
      - student_id must exist and have role 'student'
      - game_id must exist
      - time_seconds >= 0
    """
    cur = get_db_cursor()
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({'error': 'Missing or invalid JSON body'}), 400

        required_fields = [
            'student_id', 'game_id', 'successful_plays', 'failed_plays',
            'abandoned', 'time_seconds'
        ]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({'error': 'Missing required fields', 'fields': missing}), 400

        student_id = data['student_id']
        game_id = data['game_id']
        successful_plays = data['successful_plays']
        failed_plays = data['failed_plays']
        abandoned = data['abandoned']
        time_seconds = data['time_seconds']

        # Basic type/value validations
        def _is_int(v):
            return isinstance(v, int) and v >= 0

        if not _is_int(student_id) or not _is_int(game_id):
            return jsonify({'error': 'student_id and game_id must be non-negative integers'}), 400
        if not _is_int(successful_plays) or not _is_int(failed_plays):
            return jsonify({'error': 'successful_plays and failed_plays must be non-negative integers'}), 400
        if not _is_int(time_seconds):
            return jsonify({'error': 'time_seconds must be a non-negative integer'}), 400
        if not isinstance(abandoned, bool):
            return jsonify({'error': 'abandoned must be boolean'}), 400

        total_rounds_reported = successful_plays + failed_plays
        if total_rounds_reported > DEFAULT_REPEATS:
            return jsonify({'error': 'Sum of successful_plays and failed_plays exceeds allowed rounds', 'max_rounds': DEFAULT_REPEATS}), 400

        # If not abandoned we expect completeness (soft validation -> warning only)
        if not abandoned and total_rounds_reported != DEFAULT_REPEATS:
            current_app.logger.warning(
                f"Completed session mismatch for student {student_id}, game {game_id}: reported rounds {total_rounds_reported} != {DEFAULT_REPEATS}"
            )

        # Validate student & role
        cur.execute("""
            SELECT u.user_id, r.role_name
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id = %s
        """, (student_id,))
        stu_row = cur.fetchone()
        if not stu_row:
            return jsonify({'error': 'Student not found'}), 404
        if stu_row['role_name'] != 'student':
            return jsonify({'error': 'Provided user is not a student'}), 400

        # Validate game
        cur.execute("SELECT game_id FROM games WHERE game_id = %s", (game_id,))
        game_row = cur.fetchone()
        if not game_row:
            return jsonify({'error': 'Game not found'}), 404

        # Insert result (sin played_parameters)
        cur.execute(
            """
            INSERT INTO game_results (
              student_id, game_id, abandoned, successful_plays, failed_plays,
              time_seconds
            ) VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING result_id
            """,
            (
                student_id,
                game_id,
                abandoned,
                successful_plays,
                failed_plays,
                time_seconds
            )
        )
        inserted = cur.fetchone()
        cur.connection.commit()

        return jsonify({
            'result_id': inserted['result_id'],
            'status': 'stored'
        }), 201

    except Exception as e:
        cur.connection.rollback()
        current_app.logger.error(f"Error creating game result: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()


@statistics_bp.route('/statistics/<int:student_id>/<int:game_id>/csv', methods=['GET'])
def export_student_game_statistics_csv(student_id: int, game_id: int):
    """
    Exporta los resultados de juego de un alumno en formato CSV.
    Query params opcionales:
      - initial_date (ISO date/datetime)
      - final_date   (ISO date/datetime)

    Columnas:
      date, game_id, successful_plays, failed_plays, abandon_plays, total_plays, average_time_seconds
    """
    cur = get_db_cursor()
    try:
        # Validaciones básicas
        cur.execute("SELECT user_id FROM users WHERE user_id = %s", (student_id,))
        if not cur.fetchone():
            return jsonify({'error': 'Student not found.'}), 404

        cur.execute("SELECT game_id FROM games WHERE game_id = %s", (game_id,))
        if not cur.fetchone():
            return jsonify({'error': 'Game not found.'}), 404

        # Fechas opcionales
        initial_date_str = request.args.get('initial_date')
        final_date_str = request.args.get('final_date')

        initial_dt = None
        final_dt = None
        try:
            if initial_date_str:
                initial_dt = _parse_iso_datetime(initial_date_str)
            if final_date_str:
                final_dt = _parse_iso_datetime(final_date_str)
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use ISO date or datetime.'}), 400

        if initial_dt and final_dt and initial_dt > final_dt:
            return jsonify({'error': 'initial_date must be before or equal to final_date.'}), 400

        # WHERE
        where = ["student_id = %s", "game_id = %s"]
        params = [student_id, game_id]

        if initial_dt:
            where.append("played_at >= %s")
            params.append(initial_dt)
        if final_dt:
            if final_date_str and len(final_date_str.strip()) == 10:
                inclusive_final = final_dt + timedelta(days=1)
                where.append("played_at < %s")
                params.append(inclusive_final)
            else:
                where.append("played_at <= %s")
                params.append(final_dt)

        where_sql = " AND ".join(where)

        # Para CSV detallado por día: agregamos por día con métricas principales
        sql = f"""
            SELECT
                DATE(played_at) AS day,
                game_id,
                COALESCE(SUM(successful_plays), 0) AS successful_plays,
                COALESCE(SUM(failed_plays), 0)     AS failed_plays,
                COALESCE(SUM(CASE WHEN abandoned THEN 1 ELSE 0 END), 0) AS abandon_plays,
                COALESCE(SUM(successful_plays + failed_plays + CASE WHEN abandoned THEN 1 ELSE 0 END), 0) AS total_plays,
                AVG(time_seconds)::NUMERIC(10,2) AS average_time
            FROM game_results
            WHERE {where_sql}
            GROUP BY DATE(played_at), game_id
            ORDER BY DATE(played_at) ASC
        """

        cur.execute(sql, tuple(params))
        rows = cur.fetchall() or []

        # Si no hay datos, devolvemos CSV con solo cabeceras
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            'date', 'game_id', 'successful_plays', 'failed_plays', 'abandon_plays', 'total_plays', 'average_time_seconds'
        ])

        for r in rows:
            writer.writerow([
                r['day'].isoformat(),
                r['game_id'],
                int(r['successful_plays'] or 0),
                int(r['failed_plays'] or 0),
                int(r['abandon_plays'] or 0),
                int(r['total_plays'] or 0),
                float(r['average_time']) if r['average_time'] is not None else ''
            ])

        csv_text = output.getvalue()
        output.close()

        filename = f"student_{student_id}_game_{game_id}_stats.csv"
        return Response(
            csv_text,
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"'
            }
        )

    except Exception as e:
        current_app.logger.error(f"Error exporting CSV for student {student_id}, game {game_id}: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()



@statistics_bp.route('/statistics/<int:student_id>/csv', methods=['GET'])
def export_student_all_game_statistics_csv(student_id: int):
    """
    Exporta los resultados de juego de un alumno en formato CSV.
    Query params opcionales:
      - initial_date (ISO date/datetime)
      - final_date   (ISO date/datetime)

    Columnas:
      date, game_id, successful_plays, failed_plays, abandon_plays, total_plays, average_time_seconds
    """
    cur = get_db_cursor()
    try:
        # Validaciones básicas
        cur.execute("SELECT user_id FROM users WHERE user_id = %s", (student_id,))
        if not cur.fetchone():
            return jsonify({'error': 'Student not found.'}), 404

        # Fechas opcionales
        initial_date_str = request.args.get('initial_date')
        final_date_str = request.args.get('final_date')

        initial_dt = None
        final_dt = None
        try:
            if initial_date_str:
                initial_dt = _parse_iso_datetime(initial_date_str)
            if final_date_str:
                final_dt = _parse_iso_datetime(final_date_str)
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use ISO date or datetime.'}), 400

        if initial_dt and final_dt and initial_dt > final_dt:
            return jsonify({'error': 'initial_date must be before or equal to final_date.'}), 400

        # WHERE
        where = ["student_id = %s"]
        params = [student_id]

        if initial_dt:
            where.append("played_at >= %s")
            params.append(initial_dt)
        if final_dt:
            if final_date_str and len(final_date_str.strip()) == 10:
                inclusive_final = final_dt + timedelta(days=1)
                where.append("played_at < %s")
                params.append(inclusive_final)
            else:
                where.append("played_at <= %s")
                params.append(final_dt)

        where_sql = " AND ".join(where)

        # Para CSV detallado por día y juego: agregamos por día y juego con métricas principales
        sql = f"""
            SELECT
                DATE(played_at) AS day,
                game_id,
                COALESCE(SUM(successful_plays), 0) AS successful_plays,
                COALESCE(SUM(failed_plays), 0)     AS failed_plays,
                COALESCE(SUM(CASE WHEN abandoned THEN 1 ELSE 0 END), 0) AS abandon_plays,
                COALESCE(SUM(successful_plays + failed_plays + CASE WHEN abandoned THEN 1 ELSE 0 END), 0) AS total_plays,
                AVG(time_seconds)::NUMERIC(10,2) AS average_time
            FROM game_results
            WHERE {where_sql}
            GROUP BY DATE(played_at), game_id
            ORDER BY DATE(played_at) ASC
        """
        cur.execute(sql, tuple(params))
        rows = cur.fetchall() or []

        # Si no hay datos, devolvemos CSV con solo cabeceras
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            'date', 'game_id', 'successful_plays', 'failed_plays', 'abandon_plays', 'total_plays', 'average_time_seconds'
        ])

        for row in rows:
            writer.writerow([
                row['day'].isoformat(),
                row['game_id'],
                int(row['successful_plays'] or 0),
                int(row['failed_plays'] or 0),
                int(row['abandon_plays'] or 0),
                int(row['total_plays'] or 0),
                float(row['average_time']) if row['average_time'] is not None else ''
            ])

        csv_text = output.getvalue()
        output.close()

        filename = f"student_{student_id}_all_games_stats.csv"
        return Response(
            csv_text,
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"'
            }
        )

    except Exception as e:
        current_app.logger.error(f"Error exporting CSV for student {student_id}: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()