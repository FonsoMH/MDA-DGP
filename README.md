# Equipo Los Especialistas

Bienvenido al repositorio oficial del grupo **Los especialistas**.  
Este espacio está dedicado al desarrollo colaborativo de nuestro proyecto dentro de la asignatura **Metodologías de Desarrollo Ágiles** (Grado en Ingeniería Informática, Universidad de Granada, curso 2025/2026).  

Aquí encontrarás toda la documentación, código fuente y materiales relacionados con el proyecto.

---

## 🚀 Objetivo del Proyecto
El propósito principal es aplicar metodologías de desarrollo ágiles en la construcción de un sistema software, siguiendo prácticas de trabajo en equipo, comunicación y gestión de calidad. Todo en colaboración del centro educativo "Nombre del insti"  

---

## 👥 Equipo de Trabajo
Nuestro grupo está compuesto por seis integrantes, cada uno con un rol específico para garantizar la buena organización y calidad del proyecto:

### Roles
- **Coordinador**: Jose Vera  
- **Catalogador**: Sergio Albacete  
- **Moderador**: Alfonso Maldonado  
- **Presentador**: Isaac Torres  
- **Gestor de calidad**: Juan Carlos Vílchez  
- **Gestor de accesibilidad**: Jorge Ródenas  

## Instalación

### Requisitos

- Node.js 18+
- npm o yarn
- Expo CLI (npm install -g expo-cli)
- Python 3.10+ (instalador oficial)
- Git
- Docker

### Configuración inicial backend

1. Copiar el 'env.template' a '.env' y configurar

2. Levantar contenedores

```bash
docker-compose up --build
```

3. Verificar /hello

```bash
http://localhost:5000/hello
```

### Configuración inicial frontend

1. Entrar en la carpeta frontend

2. Instalar dependencias

```
npm install
npx expo install react-dom react-native-web
npm install axios
```

3. Levantar la app

```
npm start
```

- Se abrirá un panel con opciones para web, emulador o móvil.

- Presiona w → web, a → Android, i → iOS, o escanea QR con Expo Go.

4. Cambiar URL en App.tsx si es necesario

```
http://TU_IP_LOCAL:5000/hello
```