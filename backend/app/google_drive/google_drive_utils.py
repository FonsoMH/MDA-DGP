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

# Function to create a folder in Google Drive
def create_drive_folder(name, parent_id=None):
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

# Function to create student folder structure in Google Drive
def create_student_drive_structure(student_id):
    try:
        root = create_drive_folder(f"student_{student_id}", parent_id=PARENT_FOLDER)

        subfolders = {}
        for sub in ["password", "feedback", "numbers", "avatar"]:
            subfolders[sub] = create_drive_folder(sub, parent_id=root)

        return root, subfolders
    except Exception as e:
        raise

# Function to upload a file to Google Drive
def upload_file_to_drive(file, parent_id=None):
    filename = file.filename
    myme_tipe = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    extension = filename.rsplit(".", 1)[1].lower()

    file_metadata = {
        "name": filename,
    }

    if parent_id:
        file_metadata["parents"] = [parent_id]
    else:
        file_metadata["parents"] = [PARENT_FOLDER]

    media = MediaInMemoryUpload(file.read(), mimetype=myme_tipe)

    try:
        created_file = drive_service.files().create(
            body=file_metadata,
            media_body=media,
            fields="id, webViewLink, size"
        ).execute()

        return {
            "file_id": created_file["id"],
            "webViewLink": created_file["webViewLink"],
            "size": created_file.get("size", 0),
            "mimeType": myme_tipe,
            "extension": extension
        }
    except Exception as e:
        raise e
    
