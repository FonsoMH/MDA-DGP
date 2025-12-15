import os
import pytest
from unittest.mock import MagicMock, patch

# 1. Configurar variables ANTES de cualquier import para evitar el error de Drive
os.environ['GOOGLE_SERVICE_ACCOUNT_FILE'] = 'dummy_creds.json'
os.environ['GOOGLE_DRIVE_PARENT_FOLDER'] = 'dummy_parent_id'
os.environ['FLASK_ENV'] = 'testing'

@pytest.fixture(scope="session", autouse=True)
def mock_google_libs():
    """
    Bloquea la conexión a Google Drive interceptando las librerías base.
    Se ejecuta automáticamente antes de todo.
    """
    with patch('google.oauth2.service_account.Credentials.from_service_account_file') as mock_creds, \
         patch('googleapiclient.discovery.build') as mock_build:
        
        mock_creds.return_value = MagicMock()
        mock_build.return_value = MagicMock()
        yield

@pytest.fixture
def app(mock_google_libs):
    from app import create_app 
    app = create_app()
    app.config["TESTING"] = True
    app.config['RESOURCE_TYPE_FOLDERS'] = {
        'documento': 'id_doc', 'imagen': 'id_img', 'video': 'id_vid'
    }
    return app

@pytest.fixture
def client(app):
    return app.test_client()

# --- CORRECCIÓN AQUÍ: RUTAS ABSOLUTAS (SIN PUNTOS AL INICIO) ---

@pytest.fixture
def mock_db():
    # ERROR ANTERIOR: '....app.resources.resources_general.get_db_cursor'
    # CORRECCIÓN: 'app.resources.resources_general.get_db_cursor'
    target = 'app.resources.resources_general.get_db_cursor'
    with patch(target) as mock:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.connection = mock_conn
        mock.return_value = mock_cursor
        yield mock_cursor

@pytest.fixture
def mock_drive():
    # CORRECCIÓN: Quitamos los puntos
    target = 'app.resources.resources_general.upload_file_to_drive'
    with patch(target) as mock:
        yield mock

@pytest.fixture
def mock_allowed_file():
    # CORRECCIÓN: Quitamos los puntos
    target = 'app.resources.resources_general.allowed_file'
    with patch(target) as mock:
        yield mock

@pytest.fixture
def mock_max_size_mb():
    # CORRECCIÓN: Quitamos los puntos
    target = 'app.resources.resources_general.MAX_FILE_SIZE_MB'
    with patch(target, 50) as mock:
        yield mock