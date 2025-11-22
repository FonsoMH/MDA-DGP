# import os
# from google.oauth2 import service_account
# from googleapiclient.discovery import build

# SCOPES = ['https://www.googleapis.com/auth/drive']
# SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")

# # IMPORTANT: folder in your own drive shared with the service account
# PARENT_FOLDER = os.getenv("GOOGLE_DRIVE_PARENT_FOLDER")

# print(">>> google_drive_utils LOADED <<<")

# credentials = service_account.Credentials.from_service_account_file(
#     SERVICE_ACCOUNT_FILE, scopes=SCOPES
# )
# drive_service = build('drive', 'v3', credentials=credentials)

# def create_drive_folder(name, parent_id=None):
#     metadata = {
#         "name": name,
#         "mimeType": "application/vnd.google-apps.folder"
#     }
#     if parent_id:
#         metadata["parents"] = [parent_id]

#     folder = drive_service.files().create(
#         body=metadata,
#         fields="id"
#     ).execute()

#     print("Created folder:", name, "->", folder["id"])
#     return folder["id"]

# def create_student_drive_structure(student_id):
#     # ROOT inside shared folder
#     root = create_drive_folder(f"student_{student_id}", parent_id=PARENT_FOLDER)

#     subfolders = {}
#     for sub in ["password", "feedback", "numbers", "avatar"]:
#         subfolders[sub] = create_drive_folder(sub, parent_id=root)

#     return root, subfolders


import os
from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/drive']
SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
PARENT_FOLDER = os.getenv("GOOGLE_DRIVE_PARENT_FOLDER")

print(">>> google_drive_utils LOADED <<<")
print("SERVICE_ACCOUNT_FILE:", SERVICE_ACCOUNT_FILE)
print("PARENT_FOLDER:", PARENT_FOLDER)

# Inicializar credenciales
try:
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    drive_service = build('drive', 'v3', credentials=credentials)
    print(">>> Google Drive service initialized successfully")
except Exception as e:
    print(">>> ERROR initializing Google Drive service:", e)
    raise

# Función para crear carpeta
def create_drive_folder(name, parent_id=None):
    print(f">>> Attempting to create folder: '{name}' under parent: {parent_id}")
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
        print(f">>> Folder '{name}' created successfully with ID: {folder['id']}")
        return folder["id"]
    except Exception as e:
        print(f">>> ERROR creating folder '{name}':", e)
        raise

# Función para crear estructura de carpetas de estudiante
def create_student_drive_structure(student_id):
    print(f">>> START create_student_drive_structure for student_id: {student_id}")
    try:
        root = create_drive_folder(f"student_{student_id}", parent_id=PARENT_FOLDER)
        print(f">>> Root folder created: {root}")

        subfolders = {}
        for sub in ["password", "feedback", "numbers", "avatar"]:
            print(f">>> Creating subfolder: {sub}")
            subfolders[sub] = create_drive_folder(sub, parent_id=root)

        print(">>> Finished creating all subfolders:", subfolders)
        return root, subfolders
    except Exception as e:
        print(">>> ERROR in create_student_drive_structure:", e)
        raise
