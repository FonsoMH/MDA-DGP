
from dotenv import load_dotenv
import os


from flask import Flask, jsonify
from flask_cors import CORS
from .db import init_app, get_db_cursor, init_db

load_dotenv()  # carga las variables del .env

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configuración de la DB
    app.config['POSTGRES_HOST'] = os.getenv("POSTGRES_HOST")
    app.config['POSTGRES_DB'] = os.getenv("POSTGRES_DB")
    app.config['POSTGRES_USER'] = os.getenv("POSTGRES_USER")
    app.config['POSTGRES_PASSWORD'] = os.getenv("POSTGRES_PASSWORD")
    app.config['POSTGRES_PORT'] = os.getenv("POSTGRES_PORT", 5432)


    # Inicializar DB
    init_app(app)
    with app.app_context():
        init_db()
    
    from . import feedback
    app.register_blueprint(feedback.bp)


    from . import games
    app.register_blueprint(games.bp)

    @app.route("/hello")
    def hello():
        cur = get_db_cursor()
        cur.execute("SELECT user_id, name FROM users")
        rows = cur.fetchall()
        cur.close()
        return jsonify(rows)

    return app
