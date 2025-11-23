from flask import Blueprint, request, jsonify, current_app
from ..db import get_db_cursor

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
        cur.execute("""
        SELECT DISTINCT r.resource_id, r.name, r.description, r.storage_url,
                            r.file_format, r.file_size, r.mime_type,
                            rt.type_name,
                            r.created_at, r.updated_at
            FROM resources r
            JOIN resource_types rt ON r.type_id = rt.type_id
            LEFT JOIN resource_tags rtag ON r.resource_id = rtag.resource_id
            LEFT JOIN tags t ON rtag.tag_id = t.tag_id
            WHERE 1=1
            """)
        
        params = []

        if search:
            cur.execute(" AND (r.name ILIKE %s OR r.description ILIKE %s)", (f'%{search}%', f'%{search}%'))
            params.extend([f'%{search}%', f'%{search}%'])
        if type_name:
            cur.execute(" AND rt.type_name = %s", (type_name,))
            params.append(type_name)
        if tags_param:
            tags = [tag.strip() for tag in tags_param.split(',')]
            tag_placeholders = ','.join(['%s'] * len(tags))
            cur.execute(f"""
                AND r.resource_id IN (
                    SELECT rtag.resource_id
                    FROM resource_tags rtag
                    JOIN tags t ON rtag.tag_id = t.tag_id
                    WHERE t.tag_name IN ({tag_placeholders})
                    GROUP BY rtag.resource_id
                    HAVING COUNT(DISTINCT t.tag_name) = %s
                )
            """, (*tags, len(tags)))
            params.extend(tags)

        cur.execute(" ORDER BY r.created_at DESC LIMIT %s OFFSET %s", (limit, offset))
        params.extend([limit, offset])

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
    finally:
        cur.close()