import io
import pytest
from flask import json

# ==============================================================================
# 1. SUBIDA DE ARCHIVOS (CA 1.1, 3.1, 3.2)
# ==============================================================================

def test_upload_valid_file_success(client, mock_db, mock_drive, mock_allowed_file):
    """(CA 1.1) Subida correcta de archivos válidos."""
    # Configuración Happy Path
    mock_allowed_file.return_value = True
    mock_drive.return_value = {
        'webViewLink': 'http://drive/file', 
        'mimeType': 'image/jpeg', 
        'size': 1024
    }
    # Simulamos: 1. Fetch type_id (si lo corriges), 2. Insert resource, 3. Select tag, 4. Insert tag
    mock_db.fetchone.side_effect = [{'resource_id': 1}, {'tag_id': 10}] 

    data = {
        'name': 'Test File', 
        'type': 'imagen', 
        'tags': 'test',
        'file': (io.BytesIO(b"data"), 'image.jpg')
    }
    
    response = client.post('/api/resources', data=data, content_type='multipart/form-data')
    
    assert response.status_code == 201
    assert 'Resource created successfully' in response.json['message']
    mock_drive.assert_called_once()
    mock_db.connection.commit.assert_called()

def test_upload_invalid_format(client, mock_allowed_file):
    """
    (CA 3.1) Rechazo de formatos no permitidos.
    """
    # El mock dice que NO es permitido
    mock_allowed_file.return_value = False
    
    data = {
        'name': 'Virus', 
        'type': 'imagen', 
        'file': (io.BytesIO(b"exe"), 'virus.exe')
    }
    
    response = client.post('/api/resources', data=data, content_type='multipart/form-data')
    
    assert response.status_code == 400
    assert 'File type not allowed' in response.json['error']

def test_upload_max_size_exceeded(client, mock_allowed_file, mock_max_size_mb, monkeypatch):
    """
    (CA 3.2) Validación de tamaño máximo.
    """
    mock_allowed_file.return_value = True
    
    monkeypatch.setattr('app.resources.resources_general.MAX_FILE_SIZE_MB', 0)
    
    data = {
        'name': 'Muy Pesado', 
        'type': 'video', 
        'file': (io.BytesIO(b"123"), 'video.mp4')
    }
    
    response = client.post('/api/resources', data=data, content_type='multipart/form-data')
    
    assert response.status_code == 400
    assert 'File size exceeds' in response.json['error']

# ==============================================================================
# 2. CRUD Y FILTROS (CA 1.1–1.4, CA 1.3, 2.1)
# ==============================================================================

def test_get_resources_filters(client, mock_db):
    """
    (CA 1.3, 2.1) Verifica que el SQL generado contiene las cláusulas
    específicas para filtrar por TYPE y TAGS.
    """
    # 1. Setup: DB devuelve algo vacío 
    mock_db.fetchall.return_value = []

    # 2. Ejecutar: Llamamos con type='imagen' y tags='urgente'
    client.get('/api/resources?type=imagen&tags=urgente')

    # 3. Capturar: Juntamos TODAS las llamadas SQL en un solo texto
    all_calls = mock_db.execute.call_args_list
    full_sql_log = " ".join([str(call.args[0]) for call in all_calls])
    print("SQL LOG:", full_sql_log)  # DEBUG

    # 4. Validar TYPE
    error_msg_type = "ERROR: No se encontró el filtro de TIPO en la consulta SQL."
    assert "rt.type_name =" in full_sql_log, error_msg_type

    # 5. Validar TAGS
    error_msg_tags = "ERROR: No se encontró el filtro de TAGS (HAVING COUNT) en la consulta SQL."
    assert "HAVING COUNT" in full_sql_log, error_msg_tags


def test_update_resource(client, mock_db):
    """(CA 1.2) Edición de recursos."""
    # 1. Select (exists), 2. Update (returning), 3. Tags operations...
    mock_db.fetchone.side_effect = [
        {'resource_id': 1}, # Exists
        {'resource_id': 1, 
         'name': 'Edited', 
         'description': 'D', 
         'storage_url': 'u',
         'file_format': 'f', 
         'file_size': 1, 
         'mime_type': 'm', 
         'type_id': 1,
         'created_at': 'd', 
         'updated_at': 'd'}
    ]
    
    response = client.put('/api/resources/1', json={'name': 'Edited'})
    
    assert response.status_code == 200
    assert response.json['name'] == 'Edited'

def test_delete_resource_success(client, mock_db):
    """(CA 1.4) Eliminación normal."""
    mock_db.fetchone.return_value = {'resource_id': 1, 'name': 'Deleted'}
    
    response = client.delete('/api/resources/1')
    
    assert response.status_code == 200
    assert 'deleted successfully' in response.json['message']

# ==============================================================================
# 3. MANEJO DE ERRORES Y CASOS BORDE (HTTP 404, 500, CA 1.4)
# ==============================================================================

def test_get_resource_404(client, mock_db):
    """(HTTP 404) Recurso no encontrado."""
    mock_db.fetchone.return_value = None
    response = client.get('/api/resources/999')
    assert response.status_code == 404
