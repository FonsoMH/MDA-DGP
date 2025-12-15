from flask import Blueprint, request, jsonify, current_app
from ..db import get_db_cursor
from .resources_utils import MAX_FILE_SIZE_MB, allowed_file, get_extension
from flask import current_app
from ..google_drive.google_drive_utils import upload_file_to_drive


resources_bp = Blueprint('resources', __name__, url_prefix='/api')

# CRUD endpoints for general resources
@resources_bp.route('/resources', methods=['GET'])
def get_resources():
    search = request.args.get('search')
    type_name = request.args.get('type')
    tags_param = request.args.get('tags')
    limit = request.args.get('limit', default=50, type=int)
    offset = request.args.get('offset', default=0, type=int)

    cur = get_db_cursor()

    try:
        # 1. Definimos la consulta BASE en una variable string
        sql_query = """
            SELECT DISTINCT r.resource_id, r.name, r.description, r.storage_url,
                            r.file_format, r.file_size, r.mime_type,
                            rt.type_name,
                            r.created_at, r.updated_at
            FROM resources r
            JOIN resource_types rt ON r.type_id = rt.type_id
            LEFT JOIN resource_tags rtag ON r.resource_id = rtag.resource_id
            LEFT JOIN tags t ON rtag.tag_id = t.tag_id
            WHERE 1=1
        """
        
        params = []

        # 2. Concatenamos las condiciones al string
        if search:
            sql_query += " AND (r.name ILIKE %s OR r.description ILIKE %s)"
            params.extend([f'%{search}%', f'%{search}%'])
        
        if type_name:
            sql_query += " AND rt.type_name = %s"
            params.append(type_name)
        
        if tags_param:
            tags = [tag.strip() for tag in tags_param.split(',')]
            tag_placeholders = ','.join(['%s'] * len(tags))
            
            sql_query += f"""
                AND r.resource_id IN (
                    SELECT rtag.resource_id
                    FROM resource_tags rtag
                    JOIN tags t ON rtag.tag_id = t.tag_id
                    WHERE t.name IN ({tag_placeholders})
                    GROUP BY rtag.resource_id
                    HAVING COUNT(DISTINCT t.name) = %s
                )
            """
            params.extend(tags)
            params.append(len(tags))

        # 3. Concatenamos el orden y paginación
        sql_query += " ORDER BY r.created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        # 4. EJECUTAMOS LA CONSULTA UNA SOLA VEZ AL FINAL
        cur.execute(sql_query, tuple(params))

        rows = cur.fetchall()
        resources = []
        for row in rows:
            resource_dict = {
                'resource_id': row['resource_id'],
                'name': row['name'],
                'description': row['description'],
                'storage_url': row['storage_url'],
                'file_format': row['file_format'],
                'file_size': row['file_size'],
                'mime_type': row['mime_type'],
                'type': row['type_name'],
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            }
            resources.append(resource_dict)

        return jsonify(resources)
    except Exception as e:
        current_app.logger.error(f"Error fetching resources: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        cur.close()


@resources_bp.route('/resources/<int:resource_id>', methods=['GET'])
def get_resource_by_id(resource_id):
    cur = get_db_cursor()

    try:
        cur.execute("""
            SELECT r.resource_id, r.name, r.description, r.storage_url,
                   r.file_format, r.file_size, r.mime_type,
                   rt.type_name,
                   r.created_at, r.updated_at
            FROM resources r
            JOIN resource_types rt ON r.type_id = rt.type_id
            WHERE r.resource_id = %s
        """, (resource_id,))

        row = cur.fetchone()
        if row is None:
            return jsonify({'error': 'Resource not found'}), 404

        resource_dict = {
            'resource_id': row['resource_id'],
            'name': row['name'],
            'description': row['description'],
            'storage_url': row['storage_url'],
            'file_format': row['file_format'],
            'file_size': row['file_size'],
            'mime_type': row['mime_type'],
            'type': row['type_name'],
            'created_at': row['created_at'],
            'updated_at': row['updated_at']
        }

        return jsonify(resource_dict)
    except Exception as e:
        current_app.logger.error(f"Error fetching resource by ID: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        cur.close()


@resources_bp.route('/resources/<int:resource_id>', methods=['PUT'])
def update_resource(resource_id):
    cur = get_db_cursor()

    try:
        cur.execute(""" SELECT * FROM resources WHERE resource_id = %s """, (resource_id,))
        existing_resource = cur.fetchone()

        if not existing_resource:
            return jsonify({'error': 'Resource with this ID already exists.'}), 404
        
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        tags_array = data.get('tags', [])
        tags = ','.join(tags_array)

        updates = []
        params = []

        if name:
            updates.append("name = %s")
            params.append(name)
        if description:
            updates.append("description = %s")
            params.append(description)

        if not updates:
            return jsonify({'error': 'No fields to update provided.'}), 400
        
        updates.append("updated_at = NOW()")
        sql = f"UPDATE resources SET {', '.join(updates)} WHERE resource_id = %s RETURNING *"
        params.append(resource_id)
        cur.execute(sql, tuple(params))
        updated_resource = cur.fetchone()

        if tags_array:
            cur.execute("DELETE FROM resource_tags WHERE resource_id = %s", (resource_id,))
            for tag_name in tags_array:
                cur.execute("SELECT tag_id FROM tags WHERE name = %s", (tag_name,))
                tag = cur.fetchone()
                if not tag:
                    cur.execute("INSERT INTO tags (name) VALUES (%s) RETURNING tag_id", (tag_name,))
                    tag_id = cur.fetchone()['tag_id']
                else:
                    tag_id = tag['tag_id']
                cur.execute("INSERT INTO resource_tags (resource_id, tag_id) VALUES (%s, %s)", (resource_id, tag_id))

        cur.connection.commit()
        resource_dict = {
            'resource_id': updated_resource['resource_id'],
            'name': updated_resource['name'],
            'description': updated_resource['description'],
            'storage_url': updated_resource['storage_url'],
            'file_format': updated_resource['file_format'],
            'file_size': updated_resource['file_size'],
            'mime_type': updated_resource['mime_type'],
            'type_id': updated_resource['type_id'],
            'created_at': updated_resource['created_at'],
            'updated_at': updated_resource['updated_at']
        }

        return jsonify(resource_dict), 200
    except Exception as e:
        cur.connection.rollback()
        current_app.logger.error(f"Error updating resource {resource_id}: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500
    finally:
        cur.close()


@resources_bp.route('/resources', methods=['POST'])
def create_resource():
    cur = get_db_cursor()

    try:
        data = request.form
        name = data.get('name')
        file = request.files.get('file')
        description = data.get('description')
        type_name = data.get('type')  
        tags_array = request.form.getlist('tags') 

        # --- VALIDACIONES BÁSICAS ---
        if not name:
            return jsonify({'error': 'Resource name is required.'}), 400
        if not file:
            return jsonify({'error': 'Resource file is required.'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed.'}), 400
        if not type_name:
            return jsonify({'error': 'Resource type is required.'}), 400

        # --- VALIDACIÓN DE TAMAÑO ---
        ext = get_extension(file.filename)
        file.seek(0, 2)
        file_size = file.tell()
        file.seek(0)
        if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
            return jsonify({'error': 'File size exceeds the maximum limit.'}), 400

        # --- [NUEVO] BUSCAR EL TYPE_ID ---
        # Buscamos el ID numérico correspondiente al nombre del tipo (ej: "imagen" -> 1)
        cur.execute("SELECT type_id FROM resource_types WHERE type_name = %s", (type_name,))
        type_row = cur.fetchone()

        if not type_row:
            return jsonify({'error': f'Resource type "{type_name}" not found in database.'}), 400
        
        type_id = type_row['type_id'] 

        # --- SUBIDA A GOOGLE DRIVE ---
        resource_type_folders = current_app.config.get('RESOURCE_TYPE_FOLDERS', {})
        parent_id = resource_type_folders.get(type_name)
        
        if not parent_id:
            return jsonify({'error': f'Resource type folder not initialized for {type_name}'}), 500

        upload_result = upload_file_to_drive(file, parent_id=parent_id)

        storage_url = upload_result['webViewLink']
        mime_type = upload_result['mimeType']
        file_size_drive = int(upload_result['size']) # Usamos el tamaño real reportado por Drive

        # --- [MODIFICADO] INSERTAR EN DB CON TYPE_ID ---
        # Se agregó 'type_id' a las columnas y al VALUES
        cur.execute("""
            INSERT INTO resources 
            (name, description, type_id, storage_url, file_format, file_size, mime_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING resource_id
        """, (name, description, type_id, storage_url, ext, file_size_drive, mime_type))
        
        resource_id = cur.fetchone()['resource_id']

        # --- PROCESAMIENTO DE TAGS (Igual que antes) ---      
        # Si recibes una sola string "tag1, tag2" en lugar de varias keys:
        if len(tags_array) == 1 and ',' in tags_array[0]:
             tags_array = tags_array[0].split(',')

        for tag_name in tags_array:
            tag_name = tag_name.strip()
            if not tag_name:
                continue
            
            cur.execute("SELECT tag_id FROM tags WHERE name = %s", (tag_name,))
            tag = cur.fetchone()
            
            if not tag:
                cur.execute("INSERT INTO tags (name) VALUES (%s) RETURNING tag_id", (tag_name,))
                tag_id = cur.fetchone()['tag_id']
            else:
                tag_id = tag['tag_id']

            cur.execute(
                "INSERT INTO resource_tags (resource_id, tag_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                (resource_id, tag_id)
            )

        cur.connection.commit()
        return jsonify({'message': 'Resource created successfully.', 'resource_id': resource_id}), 201

    except Exception as e:
        cur.connection.rollback()
        current_app.logger.error(f"Error creating resource: {e}")
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500

    finally:
        cur.close()


@resources_bp.route('/resources/<int:resource_id>', methods=['DELETE'])
def delete_resource(resource_id):
    cur = get_db_cursor()

    try:
        cur.execute("SELECT * FROM resources WHERE resource_id = %s", (resource_id,))
        resource = cur.fetchone()

        if not resource:
            return jsonify({'error': 'Resource not found.'}), 404

        cur.execute("DELETE FROM resource_tags WHERE resource_id = %s", (resource_id,))
        cur.execute("DELETE FROM resources WHERE resource_id = %s", (resource_id,))

        cur.connection.commit()
        return jsonify({
            'message': f"Resource '{resource['name']}' deleted successfully.",
            'resource_id': resource_id
        }), 200
    except Exception as e:
        cur.connection.rollback()
        current_app.logger.error(f"Error deleting resource {resource_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        cur.close()


        

