import os
import io
import time
import pytest
import re
from app.db import get_db_cursor
from app.google_drive.google_drive_utils import drive_service

def test_upload_real_file_cycle(client, app, delete_file_from_drive):
    """
    (CA 1.1) Ciclo completo REAL usando el archivo trash_can.png de ASSETS.
    """
    # ------------------------------------------------------------------
    # 1. CALCULAR RUTA ABSOLUTA
    # ------------------------------------------------------------------
    current_dir = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(current_dir, '..', 'assets', 'trash_can.png')
    image_path = os.path.normpath(image_path)
    
    if not os.path.exists(image_path):
        pytest.fail(f"❌ No se encontró la imagen en: {image_path}")

    with open(image_path, 'rb') as f:
        file_content = f.read()

    # ------------------------------------------------------------------
    # 2. PREPARAR EL PAYLOAD
    # ------------------------------------------------------------------
    data = {
        'name': 'Foto Real Trash Can',
        'description': 'Subida real leyendo archivo png del disco',
        'type': 'pictograma', 
        'file': (io.BytesIO(file_content), 'trash_can.png')
    }

    # ------------------------------------------------------------------
    # 3. EJECUTAR SUBIDA
    # ------------------------------------------------------------------
    print(f"\n🚀 Subiendo {image_path} a Google Drive...")
    start_time = time.time()
    
    response = client.post('/api/resources', data=data, content_type='multipart/form-data')
    
    duration = time.time() - start_time
    print(f"⏱️ Subida completada en {duration:.2f} segundos.")

    # ------------------------------------------------------------------
    # 4. VALIDACIONES API
    # ------------------------------------------------------------------
    if response.status_code != 201:
        pytest.fail(f"Error API ({response.status_code}): {response.json}")

    resource_id = response.json['resource_id']
    print(f"✅ Resource ID creado: {resource_id}")

    # ------------------------------------------------------------------
    # 5. VALIDACIÓN BASE DE DATOS (PostgreSQL)
    # ------------------------------------------------------------------
    with app.app_context():
        cur = get_db_cursor()
        cur.execute("SELECT * FROM resources WHERE resource_id = %s", (resource_id,))
        row = cur.fetchone()
        cur.close()

        assert row is not None
        storage_url = row['storage_url']
        
        print(f"✅ URL guardada: {storage_url}")
        
        # --- 5. LÓGICA DE BORRADO DE GOOGLE DRIVE ---
        # La URL es tipo: https://drive.google.com/file/d/1Mqaz.../view?usp=drivesdk
        # Usamos Regex para capturar lo que hay después de "/d/" y antes de "/"
        
        match = re.search(r'/d/([a-zA-Z0-9_-]+)', storage_url)
        
        if match:
            google_file_id = match.group(1)
            print(f"🔍 ID de Google extraído: {google_file_id}")
            
            # Llamamos a la fixture que definimos en conftest.py
            print("🧹 Ejecutando limpieza en Google Drive...")
            delete_file_from_drive(google_file_id)
        else:
            print(f"⚠️ No se pudo extraer el ID de la URL: {storage_url}. El archivo quedará en Drive.")


# # ==============================================================================
# # 2. VALIDACIONES DE FORMATO Y TAMAÑO (CA 3.1, 3.2)
# # ==============================================================================
def test_real_upload_invalid_format(client):
    """(CA 3.1) Rechazo real de formatos."""
    data = {
        'name': 'Virus Real',
        'type': 'documento',
        'file': (io.BytesIO(b"exe content"), 'malware.exe')
    }
    response = client.post('/api/resources', data=data, content_type='multipart/form-data')
    
    assert response.status_code == 400
    assert 'File type not allowed' in response.json['error']

def test_real_upload_max_size(client, monkeypatch):
    """
    (CA 3.2) Validación de tamaño máximo en entorno real.
    ESTRATEGIA: En lugar de subir 50MB, bajamos el límite de la app a 0MB
    usando monkeypatch. Así cualquier archivo pequeño disparará el error.
    """
    monkeypatch.setattr('app.resources.resources_general.MAX_FILE_SIZE_MB', 0)
    
    # 2. Preparamos un archivo pequeño (que ahora será ilegal por ser > 0)
    data = {
        'name': 'Archivo "Pesado"',
        'type': 'pictograma',
        'file': (io.BytesIO(b"12345"), 'heavy.jpg') 
    }
    
    # 3. Ejecutamos la petición real
    print("\n⚖️ Probando validación de tamaño (Límite forzado a 0MB)...")
    response = client.post('/api/resources', data=data, content_type='multipart/form-data')
    
    # 4. Validamos
    # El servidor debe rechazarlo inmediatamente (400) sin subir nada a Drive/DB
    assert response.status_code == 400
    assert 'File size exceeds' in response.json['error']
    
    print("✅ El sistema rechazó correctamente el archivo por exceso de tamaño.")


# # ==============================================================================
# # 3. FILTROS Y BÚSQUEDA REAL (CA 1.3, 2.1)
# # ==============================================================================


# # ==============================================================================
# # 4. Obtención REAL de archivos (CA 2.2)
# # ==============================================================================

def test_real_get_resource_file(client):
    """
    (CA 1.1) Ciclo: Subir archivo -> Obtener Metadatos (GET) -> Descargar de Drive -> Comparar Bytes.
    """
    # 1. PREPARACIÓN
    current_dir = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(current_dir, '..', 'assets', 'trash_can.png')
    
    with open(image_path, 'rb') as f:
        file_content = f.read()

    data = {
        'name': 'Trash Can para GET',
        'type': 'pictograma',
        'file': (io.BytesIO(file_content), 'trash_can.png')
    }

    # 2. SUBIR
    print(f"\n🚀 Subiendo archivo para test de obtención...")
    upload_response = client.post('/api/resources', data=data, content_type='multipart/form-data')
    assert upload_response.status_code == 201
    resource_id = upload_response.json['resource_id']

    # 3. OBTENER METADATOS VÍA API (GET)
    print(f"🔍 Consultando API GET /resources/{resource_id}...")
    get_response = client.get(f'/api/resources/{resource_id}')
    
    assert get_response.status_code == 200
    
    # --- CORRECCIÓN AQUÍ ---
    # El response.data es JSON, no la imagen. Validamos el JSON.
    json_data = get_response.json
    assert json_data['name'] == 'Trash Can para GET'
    assert json_data['mime_type'] == 'image/png'
    assert 'drive.google.com' in json_data['storage_url']
    
    print("✅ Metadatos JSON validados correctamente.")

    # 4. (AVANZADO) DESCARGAR DE DRIVE Y COMPARAR BYTES
    storage_url = json_data['storage_url']
    match = re.search(r'/d/([a-zA-Z0-9_-]+)', storage_url)
    
    if match:
        file_id = match.group(1)
        print(f"⬇️ Descargando archivo real de Google Drive (ID: {file_id})...")
        
        # Usamos la API de Google para bajar los bytes
        downloaded_content = drive_service.files().get_media(fileId=file_id).execute()
        
        # AHORA SÍ comparamos bytes con bytes
        assert downloaded_content == file_content
        print("✅ ¡ÉXITO! El archivo en la nube es idéntico al original.")
    else:
        pytest.fail("No se pudo extraer el ID de Google Drive para verificar el contenido.")

    # 5. LIMPIEZA
    print("🧹 Limpiando: Borrando archivo de Google Drive...")
    drive_service.files().delete(fileId=file_id).execute()