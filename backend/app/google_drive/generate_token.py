import os
from google_auth_oauthlib.flow import InstalledAppFlow

# Permisos
SCOPES = ['https://www.googleapis.com/auth/drive']

def main():
    # Asegúrate de que credentials_oauth.json esté en la misma carpeta
    if not os.path.exists('credentials_oauth.json'):
        print("❌ Error: No encuentro el archivo 'credentials_oauth.json'")
        return

    flow = InstalledAppFlow.from_client_secrets_file(
        'credentials_oauth.json', SCOPES)
    
    print("\n--- INSTRUCCIONES ---")
    print("1. Copia el enlace de abajo.")
    print("2. Pégalo en el navegador de tu Windows.")
    print("3. Inicia sesión y autoriza.")
    print("4. Si te sale una web que dice 'The site can't be reached' (localhost), NO TE PREOCUPES.")
    print("---------------------\n")

    # TRUCO: open_browser=False evita que Python intente abrir Chrome en Linux y falle.
    # Usamos un puerto fijo (ej: 8080) por si necesitas mapearlo, aunque suele ir bien automático.
    creds = flow.run_local_server(port=0, open_browser=False)

    # Guardar token
    with open('token.json', 'w') as token:
        token.write(creds.to_json())
    
    print("\n✅ ¡ÉXITO! Se ha creado 'token.json'.")

if __name__ == '__main__':
    main()