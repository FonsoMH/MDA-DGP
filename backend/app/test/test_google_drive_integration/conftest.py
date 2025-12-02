import pytest
import os
from app import create_app
from app.db import get_db_cursor

# Importamos TUS funciones y variables reales
from app.google_drive.google_drive_utils import (
    drive_service, 
    get_or_create_folder, 
    PARENT_FOLDER
)

@pytest.fixture(scope='session')
def app():
    """
    Crea la app FLASK REAL e inicializa la estructura en Google Drive
    usando las funciones de utilidad existentes.
    """
    os.environ['FLASK_ENV'] = 'testing'
    
    app = create_app()
    app.config.update({"TESTING": True})

    # --- INICIALIZACIÓN DE DRIVE (Con tus funciones) ---
    with app.app_context():
        try:
            print("\n🌍 Conectando a Google Drive real...")
            
            # 1. Asegurar que existe la carpeta raíz "Resources"
            #    Usa tu función get_or_create_folder para no duplicarla
            resources_root_id = get_or_create_folder("Resources", PARENT_FOLDER)
            print(f"   📂 Carpeta Root 'Resources' ID: {resources_root_id}")

            # 2. Definir qué carpetas necesitamos y cómo se llaman en Drive
            #    Formato: 'clave_que_usa_el_endpoint': 'Nombre_en_Drive'
            folders_to_init = {
                'imagen': 'Images',
                'video': 'Videos',
                'audio': 'Audios',
                'pictograma': 'Pictograms',
                'documento': 'Documents' # Agregamos esta si tu test usa 'documento'
            }
            
            real_folder_ids = {}

            # 3. Iterar y obtener/crear los IDs reales
            for app_key, drive_name in folders_to_init.items():
                # Usamos TU función: busca dentro de 'Resources'
                folder_id = get_or_create_folder(drive_name, resources_root_id)
                real_folder_ids[app_key] = folder_id
            
            # 4. Inyectar la configuración en la App
            #    Ahora, cuando el endpoint busque config['RESOURCE_TYPE_FOLDERS']['imagen'],
            #    encontrará el ID real de Google Drive.
            app.config['RESOURCE_TYPE_FOLDERS'] = real_folder_ids
            
            print(f"✅ IDs de carpetas cargados: {real_folder_ids}")

        except Exception as e:
            print(f"⚠️ Error inicializando Drive en el test: {e}")
            # Importante: Si esto falla, los tests de subida fallarán con error 500

    return app

@pytest.fixture(scope='session')
def client(app):
    return app.test_client()

@pytest.fixture(autouse=True)
def clean_db_and_drive():
    """Limpia la base de datos antes y después de cada test."""
    _clean_database()
    yield
    _clean_database()

def _clean_database():
    try:
        cur = get_db_cursor()
        cur.execute("DELETE FROM resource_tags")
        cur.execute("DELETE FROM resources")
        # cur.execute("DELETE FROM tags") # Opcional
        cur.connection.commit()
        cur.close()
    except Exception as e:
        print(f"Error DB Clean: {e}")

@pytest.fixture
def delete_file_from_drive():
    """
    Ayudante para borrar archivos reales de Drive (ya que DELETE endpoint no lo hace aún).
    """
    def _delete(file_id):
        if file_id:
            try:
                drive_service.files().delete(fileId=file_id).execute()
                print(f"🗑️ Archivo borrado de Drive: {file_id}")
            except Exception:
                print(f"⚠️ No se pudo borrar archivo de Drive: {file_id}")
    return _delete