from flask import jsonify


def success_response(message: str, http_status: int = 200, **extra):
    """Return a standardized success JSON response.

    Structure:
    {
        "status": "success",
        "message": <mensaje>,
        ...extra
    }
    """
    payload = {
        "status": "success",
        "message": message,
    }
    payload.update(extra)
    return jsonify(payload), http_status


def error_response(message: str, http_status: int = 400, **extra):
    """Return a standardized error JSON response.

    Structure:
    {
        "status": "error",
        "message": <mensaje>,
        ...extra
    }
    """
    payload = {
        "status": "error",
        "message": message,
    }
    payload.update(extra)
    return jsonify(payload), http_status
