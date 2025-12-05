import pytest
import os
from app import create_app
from app.db import get_db_cursor
from app.google_drive.google_drive_utils import (
    drive_service, 
    get_or_create_folder, 
    PARENT_FOLDER
)

@pytest.fixture(scope='session')
def app():
    os.environ['FLASK_ENV'] = 'testing'
    app = create_app()
    app.config.update({"TESTING": True})

    # --- 1. INICIALIZAR GOOGLE DRIVE ---
    with app.app_context():
        try:
            print("\n🌍 Conectando a Google Drive real...")
            resources_root_id = get_or_create_folder("Resources", PARENT_FOLDER)
            
            # Mapa de carpetas
            folders_to_init = {
                'video': 'Videos',
                'pictograma': 'Pictograms',
            }
            real_folder_ids = {}
            for app_key, drive_name in folders_to_init.items():
                folder_id = get_or_create_folder(drive_name, resources_root_id)
                real_folder_ids[app_key] = folder_id
            
            app.config['RESOURCE_TYPE_FOLDERS'] = real_folder_ids
            print(f"✅ IDs de Drive cargados.")
        except Exception as e:
            print(f"⚠️ Error inicializando Drive: {e}")

    # --- 2. INICIALIZAR BASE DE DATOS (CREAR TABLAS) ---
    # Esto soluciona el error 'relation resources does not exist'
    with app.app_context():
        _init_db_tables()

    return app

def _init_db_tables():
    """Crea las tablas y datos maestros si no existen."""
    print("\n🔨 Creando tablas en base de datos de test...")
    cur = get_db_cursor()
    try:
        # 1. Crear Tabla Resource Types
        cur.execute("""
            CREATE TABLE IF NOT EXISTS resource_types (
                type_id SERIAL PRIMARY KEY,
                type_name VARCHAR(50) NOT NULL UNIQUE,
                is_default BOOLEAN DEFAULT FALSE
            );
        """)

        # 2. Crear Tabla Resources
        cur.execute("""
            CREATE TABLE IF NOT EXISTS resources (
                resource_id SERIAL PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                description TEXT,
                type_id INTEGER NOT NULL REFERENCES resource_types(type_id),
                storage_url TEXT NOT NULL,
                file_format VARCHAR(10) NOT NULL,         
                file_size BIGINT NOT NULL,                
                mime_type VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 3. Crear Tabla Tags
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tags (
                tag_id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE
            );
        """)

        # 4. Crear Tabla Intermedia
        cur.execute("""
            CREATE TABLE IF NOT EXISTS resource_tags (
                resource_id INTEGER NOT NULL REFERENCES resources(resource_id) ON DELETE CASCADE,
                tag_id INTEGER NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
                PRIMARY KEY (resource_id, tag_id)
            );
        """)

        # 5. INSERTAR DATOS MAESTROS (CRÍTICO)
        # Tu test usa type='imagen'. Si no existe en la DB, fallará por Foreign Key.
        types_to_insert = ['video', 'pictograma']
        for t in types_to_insert:
            cur.execute("INSERT INTO resource_types (type_name) VALUES (%s) ON CONFLICT DO NOTHING", (t,))

        cur.connection.commit()
        print("✅ Tablas creadas y tipos insertados.")
    except Exception as e:
        print(f"❌ Error creando tablas: {e}")
        cur.connection.rollback()
    finally:
        cur.close()

@pytest.fixture(scope='session')
def client(app):
    return app.test_client()

@pytest.fixture(autouse=True)
def clean_db_and_drive(app):
    with app.app_context():
        _clean_database()
    yield
    with app.app_context():
        _clean_database()

def _clean_database():
    try:
        cur = get_db_cursor()
        # Borramos datos pero NO borramos las tablas ni los resource_types
        cur.execute("DELETE FROM resource_tags")
        cur.execute("DELETE FROM resources")
        # No borramos resource_types para que los IDs sigan siendo válidos
        cur.connection.commit()
        cur.close()
    except Exception as e:
        print(f"Error DB Clean: {e}")

@pytest.fixture
def delete_file_from_drive():
    def _delete(file_id):
        if file_id:
            try:
                drive_service.files().delete(fileId=file_id).execute()
            except Exception:
                pass
    return _delete