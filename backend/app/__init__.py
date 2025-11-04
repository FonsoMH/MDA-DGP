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

    from . import auth
    app.register_blueprint(auth.auth_bp)

    from .accessibilitySettings import accessibility_settings_bp
    app.register_blueprint(accessibility_settings_bp)

    from .users.teacher import teacher_bp
    app.register_blueprint(teacher_bp)

    from .users.students import students_bp
    app.register_blueprint(students_bp)

    from .users.admin import admin_bp
    app.register_blueprint(admin_bp)

    from . import general_users
    app.register_blueprint(general_users.bp)
    

    return app