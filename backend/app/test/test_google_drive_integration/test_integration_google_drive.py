import os
import io
import time
import pytest
from app.db import get_db_cursor

def test_upload_real_file_cycle(client, delete_file_from_drive):
    """
    (CA 1.1) Ciclo completo REAL usando un archivo de la carpeta ASSETS.
    """
    # --- 1. Definir ruta y leer archivo ---
    current_dir = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(current_dir, '..', 'assets', 'trash_can.png')
    
    # Normalizamos la ruta (resuelve los puntos ..)
    image_path = os.path.normpath(image_path)
    
    # Verificación de seguridad para que no falle feo si olvidas el archivo
    if not os.path.exists(image_path):
        pytest.fail(f"❌ No se encontró la imagen de prueba en: {image_path}")

    # Leemos el archivo en modo BINARIO ('rb')
    with open(image_path, 'rb') as f:
        file_content = f.read()

    # --- 2. Preparar el Payload ---
    data = {
        'name': 'Foto Real desde Assets',
        'description': 'Subida real leyendo archivo del disco',
        'type': 'image', # Asegúrate de que este tipo exista en tu DB
        'tags': 'integration,assets,real',
        # Es CRÍTICO poner el nombre con extensión .jpg para que detecte el MIME
        'file': (io.BytesIO(file_content), 'foto_subida.jpg')
    }

    # --- 3. Ejecutar Subida ---
    print(f"\n🚀 Subiendo {image_path} a Google Drive...")
    start_time = time.time()
    
    response = client.post('/api/resources', data=data, content_type='multipart/form-data')
    
    duration = time.time() - start_time
    print(f"⏱️ Subida completada en {duration:.2f} segundos.")

    # --- 4. Validaciones API ---
    if response.status_code != 201:
        pytest.fail(f"Error API: {response.json}")

    resource_id = response.json['resource_id']
    print(f"✅ Resource ID creado: {resource_id}")

    # --- 5. Validación Base de Datos (PostgreSQL) ---
    cur = get_db_cursor()
    cur.execute("SELECT * FROM resources WHERE resource_id = %s", (resource_id,))
    row = cur.fetchone()
    cur.close()

    assert row is not None
    assert row['name'] == 'Foto Real desde Assets'
    assert row['file_size'] > 0
    # Verificamos que se detectó correctamente que es una imagen
    assert 'image' in row['mime_type'] 
    assert 'drive.google.com' in row['storage_url']
    
    print(f"✅ URL guardada en DB: {row['storage_url']}")

    # --- 6. Limpieza (Opcional pero recomendada) ---
    # Si logras obtener el Google File ID (a veces está en el response o hay que sacarlo de la URL)
    # puedes llamar a delete_file_from_drive(google_id)


# # ==============================================================================
# # 2. VALIDACIONES DE FORMATO Y TAMAÑO (CA 3.1, 3.2)
# # ==============================================================================

# def test_real_upload_invalid_format(client):
#     """(CA 3.1) Rechazo real de formatos."""
#     data = {
#         'name': 'Virus Real',
#         'type': 'documento',
#         'file': (io.BytesIO(b"exe content"), 'malware.exe')
#     }
#     response = client.post('/api/resources', data=data, content_type='multipart/form-data')
    
#     assert response.status_code == 400
#     assert 'File type not allowed' in response.json['error']

# def test_real_upload_max_size(client):
#     """
#     (CA 3.2) Validación de tamaño.
#     NOTA: No podemos subir 50MB reales en cada test.
#     Probamos con un archivo pequeño pero simulamos el límite configurando la app
#     o confiamos en que el backend valida 'MAX_FILE_SIZE_MB'.
#     """
#     # Generar 1 byte más del límite sería muy lento si el límite es 50MB.
#     # Aquí confiamos en el Test Unitario para la lógica exacta.
#     # O, intentamos subir algo que sabemos que tu lógica rechaza.
#     pass


# # ==============================================================================
# # 3. FILTROS Y BÚSQUEDA REAL (CA 1.3, 2.1)
# # ==============================================================================

# def test_real_filters_and_search(client, delete_file_from_drive):
#     """
#     (CA 1.3) Inserta 2 archivos reales y prueba que el buscador SQL
#     realmente filtre los resultados.
#     """
#     # 1. Insertar Recurso A (Imagen)
#     data_a = {
#         'name': 'Foto Vacaciones',
#         'type': 'imagen',
#         'tags': 'verano',
#         'file': (io.BytesIO(b"img"), 'foto.jpg')
#     }
#     client.post('/api/resources', data=data_a, content_type='multipart/form-data')

#     # 2. Insertar Recurso B (Documento)
#     data_b = {
#         'name': 'Contrato Trabajo',
#         'type': 'documento',
#         'tags': 'legal,urgente',
#         'file': (io.BytesIO(b"doc"), 'contrato.pdf')
#     }
#     client.post('/api/resources', data=data_b, content_type='multipart/form-data')

#     # 3. Probar Filtro: Solo 'documento'
#     resp = client.get('/api/resources?type=documento')
#     assert resp.status_code == 200
#     resources = resp.json
    
#     assert len(resources) == 1
#     assert resources[0]['name'] == 'Contrato Trabajo'

#     # 4. Probar Filtro: Tag 'verano'
#     resp_tag = client.get('/api/resources?tags=verano')
#     assert len(resp_tag.json) == 1
#     assert resp_tag.json[0]['name'] == 'Foto Vacaciones'


# # ==============================================================================
# # 4. CRUD COMPLETO (Create, Update, Delete)
# # ==============================================================================

# def test_real_crud_lifecycle(client):
    """
    (CA 1.1 - 1.4) Ciclo de vida completo en DB Real.
    """
    # 1. CREATE
    data = {'name': 'Ciclo Vida', 'type': 'imagen', 'file': (io.BytesIO(b"x"), 'img.png')}
    resp = client.post('/api/resources', data=data, content_type='multipart/form-data')
    res_id = resp.json['resource_id']

    # 2. UPDATE
    new_data = {'name': 'Ciclo Vida EDITADO', 'tags': ['nuevo']}
    resp_put = client.put(f'/api/resources/{res_id}', json=new_data)
    assert resp_put.status_code == 200
    assert resp_put.json['name'] == 'Ciclo Vida EDITADO'

    # Verificar en DB que se guardó el cambio
    cur = get_db_cursor()
    cur.execute("SELECT name FROM resources WHERE resource_id = %s", (res_id,))
    assert cur.fetchone()['name'] == 'Ciclo Vida EDITADO'
    
    # Verificar Tags
    cur.execute("""
        SELECT t.name FROM tags t 
        JOIN resource_tags rt ON t.tag_id = rt.tag_id 
        WHERE rt.resource_id = %s
    """, (res_id,))
    tag_row = cur.fetchone()
    assert tag_row['name'] == 'nuevo' # O el nombre que uses en tu lógica de tags
    cur.close()

    # 3. DELETE
    resp_del = client.delete(f'/api/resources/{res_id}')
    assert resp_del.status_code == 200
    
    # Verificar que ya no existe en DB
    cur = get_db_cursor()
    cur.execute("SELECT * FROM resources WHERE resource_id = %s", (res_id,))
    assert cur.fetchone() is None
    cur.close()