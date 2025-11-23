
import mimetypes
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload, MediaInMemoryUpload

SCOPES = ['https://www.googleapis.com/auth/drive']
SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
PARENT_FOLDER = os.getenv("GOOGLE_DRIVE_PARENT_FOLDER")

# Inicializar credenciales
try:
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    drive_service = build('drive', 'v3', credentials=credentials)
except Exception as e:
    raise

# -----------------------------
# UTILIDADES
# -----------------------------

def create_drive_folder(name, parent_id=None):
    """
    Crea una carpeta en Google Drive bajo parent_id.
    """
    metadata = {
        "name": name,
        "mimeType": "application/vnd.google-apps.folder"
    }
    if parent_id:
        metadata["parents"] = [parent_id]

    try:
        folder = drive_service.files().create(
            body=metadata,
            fields="id"
        ).execute()
        return folder["id"]
    except Exception as e:
        raise


def get_or_create_folder(name, parent_id):
    """
    Busca una carpeta por nombre bajo parent_id y la crea si no existe.
    """
    query = drive_service.files().list(
        q=f"mimeType='application/vnd.google-apps.folder' and '{parent_id}' in parents and name='{name}' and trashed=false",
        fields="files(id, name)"
    ).execute()
    files = query.get("files", [])
    if files:
        return files[0]["id"]
    return create_drive_folder(name, parent_id=parent_id)


def init_drive_structure():
    """
    Inicializa carpetas principales: Resources y Students.
    Dentro de Resources crea subcarpetas por tipo de archivo.
    """
    # Carpeta Resources
    resources_root = get_or_create_folder("Resources", PARENT_FOLDER)
    resource_type_folders = {}
    for t in ["Images", "Videos", "Audios", "Pictograms"]:
        resource_type_folders[t] = get_or_create_folder(t, resources_root)

    # Carpeta Students
    students_root = get_or_create_folder("Students", PARENT_FOLDER)

    return resources_root, resource_type_folders, students_root


def create_student_drive_structure(student_id):
    """
    Crea la carpeta student_<id> dentro de Students y sus subcarpetas internas.
    """
    # Obtener Students root
    students_root = get_or_create_folder("Students", PARENT_FOLDER)
    # Crear carpeta estudiante
    student_root = create_drive_folder(f"student_{student_id}", parent_id=students_root)

    subfolders = {}
    for sub in ["password", "feedback", "numbers", "avatar"]:
        subfolders[sub] = create_drive_folder(sub, parent_id=student_root)

    return student_root, subfolders


def upload_file_to_drive(file, parent_id=None):
    """
    Sube un archivo a Google Drive y devuelve metadata.
    """
    filename = file.filename
    mime_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    extension = filename.rsplit(".", 1)[1].lower()

    file_metadata = {"name": filename}
    if parent_id:
        file_metadata["parents"] = [parent_id]
    else:
        file_metadata["parents"] = [PARENT_FOLDER]

    media = MediaInMemoryUpload(file.read(), mimetype=mime_type)

    try:
        created_file = drive_service.files().create(
            body=file_metadata,
            media_body=media,
            fields="id, webViewLink, size"
        ).execute()

        return {
            "file_id": created_file["id"],
            "webViewLink": created_file["webViewLink"],
            "size": int(created_file.get("size", 0)),
            "mimeType": mime_type,
            "extension": extension
        }
    except Exception as e:
        raise e
