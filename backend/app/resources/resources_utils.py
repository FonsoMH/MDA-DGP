from flask import jsonify
from ..db import get_db_cursor

ALLOWED_FILE_TYPES = {'jpeg', 'jpg', 'png', 'mp4', 'mp3'}
MAX_FILE_SIZE_MB = 50

def allowed_file(filename):
    if "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in ALLOWED_FILE_TYPES


def get_extension(filename):
    return filename.rsplit(".", 1)[1].lower()
