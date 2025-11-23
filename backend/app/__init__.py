from dotenv import load_dotenv
import os

from flask import Flask, jsonify
from flask_cors import CORS

from .google_drive.google_drive_utils import init_drive_structure
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

    try:
        resources_root, resource_type_folders, students_root = init_drive_structure()
        app.config['RESOURCES_ROOT'] = resources_root
        app.config['RESOURCE_TYPE_FOLDERS'] = resource_type_folders
        app.config['STUDENTS_ROOT'] = students_root
        print("Drive structure initialized:")
        print("Resources root:", resources_root)
        print("Resource type folders:", resource_type_folders)
        print("Students root:", students_root)
    except Exception as e:
        print("Error initializing Drive structure:", e)
    
    
    from .feedback import feedback
    app.register_blueprint(feedback.feedback_bp)

    from .games import game_config
    app.register_blueprint(game_config.config_bp)

    from .login import auth
    app.register_blueprint(auth.auth_bp)

    from .accessibility.accessibilitySettings import accessibility_settings_bp
    app.register_blueprint(accessibility_settings_bp)

    from .accessibility.accessibility import accessibility_bp
    app.register_blueprint(accessibility_bp)

    from .users.teachers import teacher_bp
    app.register_blueprint(teacher_bp)

    from .users.students import students_bp
    app.register_blueprint(students_bp)

    from .users.admins import admin_bp
    app.register_blueprint(admin_bp)

    from .users.general_users import users_bp
    app.register_blueprint(users_bp)

    from .users.user_deletion import users_deletion_bp
    app.register_blueprint(users_deletion_bp)

    from .resources.resources_general import resources_bp
    app.register_blueprint(resources_bp)


    return app