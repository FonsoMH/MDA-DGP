from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta, time
from ..db import get_db_cursor

statistics_bp = Blueprint('statistics', __name__, url_prefix='/api')


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
        if not game_row and not game_id == -1:
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
        if game_id >= 0 and game_id <= 4:
            where = ["student_id = %s", "game_id = %s"]
            params = [student_id, game_id]
        else:
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
