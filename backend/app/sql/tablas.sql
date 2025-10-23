CREATE TYPE IF NOT EXISTS nivel_dificultad AS ENUM (
    'facil', 
    'medio', 
    'dificil'
);

-- ========= CREACIÓN DE TABLAS =========

--Tabla de Roles
CREATE TABLE IF NOT EXISTS roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

--Tabla de Usuarios (Central)
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    
    id_rol INTEGER NOT NULL REFERENCES roles(id_rol),
    
    -- Relación Docente -> Estudiante (solo para estudiantes)
    id_docente_asignado INTEGER REFERENCES usuarios(id_usuario) NULL
);

-- Tabla de Juegos (Catálogo)
CREATE TABLE IF NOT EXISTS juegos (
    id_juego SERIAL PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

--Ajustes de Accesibilidad (1 a 1 con Estudiante)
CREATE TABLE IF NOT EXISTS ajustes_accesibilidad (
    id_estudiante INTEGER PRIMARY KEY REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    color_fondo VARCHAR(7) DEFAULT '#D9D9D9',
    color_foreground VARCHAR(7) DEFAULT '#000000',
    iconos_posicion VARCHAR(10) DEFAULT 'izquierda' CHECK (iconos_posicion IN ('izquierda', 'derecha')),
    modo_alto_contraste BOOLEAN DEFAULT false,
    modo_ver_numeros BOOLEAN DEFAULT true, 
    tamano_fuente INTEGER DEFAULT 16 CHECK (tamano_fuente > 8)
);

-- Configuración de Dificultad (Tabla PIVOTE)
CREATE TABLE IF NOT EXISTS configuracion_juegos_estudiante (
    id_estudiante INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_juego INTEGER NOT NULL REFERENCES juegos(id_juego) ON DELETE CASCADE,
    dificultad nivel_dificultad NOT NULL DEFAULT 'facil',
    
    PRIMARY KEY (id_estudiante, id_juego)
);

--  Resultados de Partidas
CREATE TABLE IF NOT EXISTS resultados_juegos (
    id_resultado SERIAL PRIMARY KEY,
    id_estudiante INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_juego INTEGER NOT NULL REFERENCES juegos(id_juego) ON DELETE RESTRICT,
    
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    puntuacion INTEGER NOT NULL,
    tiempo_segundos INTEGER NOT NULL,
    
    dificultad_jugada nivel_dificultad NOT NULL 
);

-- Índices en claves foráneas
CREATE INDEX IF NOT EXISTS idx_usuario_rol ON usuarios(id_rol);
CREATE INDEX IF NOT EXISTS idx_id_docente_asignado ON usuarios(id_docente_asignado);
CREATE INDEX IF NOT EXISTS idx_resultados_estudiante ON resultados_juegos(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_resultados_juego ON resultados_juegos(id_juego);


-- ========= RELLENO DE DATOS INICIALES =========
-- Se usa 'ON CONFLICT DO NOTHING' para que el script no falle si ya existen

-- Rellenar Roles
INSERT INTO roles (nombre_rol) VALUES
('estudiante'),
('docente'),
('admin')
ON CONFLICT (nombre_rol) DO NOTHING;

-- Rellenar Juegos
INSERT INTO juegos (slug, nombre, descripcion) VALUES
('toca-numero', 'Toca el número que suena', 'Se escucha un número y se escoge el correspondiente de entre los mostrados en pantalla.'),
('ordena-secuencia', 'Ordena la secuencia', 'Se muestra una fila con números desordenados y hay que colocarlos ordenados.'),
('reparte-igual', 'Reparte el mismo número', 'Mover objetos/bolas a recipientes para que todos tengan la misma cantidad (suma).'),
('deja-igual', 'Deja el mismo número', 'Sacar objetos/bolas de recipientes para que todos tengan la misma cantidad (resta).')
ON CONFLICT (slug) DO NOTHING;

-- Rellenar Usuarios
INSERT INTO usuarios (nombre, correo, contrasena_hash, id_rol) 
VALUES ('Ana Admin', 'admin@app.com', 'hash_falso_123', (SELECT id_rol FROM roles WHERE nombre_rol = 'admin'))
ON CONFLICT (correo) DO NOTHING;

INSERT INTO usuarios (nombre, correo, contrasena_hash, id_rol) 
VALUES ('Profesor Pablo', 'pablo@app.com', 'hash_falso_123', (SELECT id_rol FROM roles WHERE nombre_rol = 'docente'))
ON CONFLICT (correo) DO NOTHING;

INSERT INTO usuarios (nombre, correo, contrasena_hash, id_rol, id_docente_asignado) 
VALUES 
('Eva Estudiante', 'eva@app.com', 'hash_falso_123', (SELECT id_rol FROM roles WHERE nombre_rol = 'estudiante'), (SELECT id_usuario FROM usuarios WHERE correo = 'pablo@app.com')),
('Leo Lector', 'leo@app.com', 'hash_falso_123', (SELECT id_rol FROM roles WHERE nombre_rol = 'estudiante'), (SELECT id_usuario FROM usuarios WHERE correo = 'pablo@app.com'))
ON CONFLICT (correo) DO NOTHING;

-- Rellenar Ajustes para 1 estudiante (Eva)
INSERT INTO ajustes_accesibilidad (id_estudiante, modo_alto_contraste, tamano_fuente, iconos_posicion)
SELECT id_usuario, true, 20, 'derecha' FROM usuarios WHERE correo = 'eva@app.com'
ON CONFLICT (id_estudiante) DO NOTHING;

-- Rellenar Configuraciones (Docente asigna dificultad)
INSERT INTO configuracion_juegos_estudiante (id_estudiante, id_juego, dificultad)
VALUES
((SELECT id_usuario FROM usuarios WHERE correo = 'eva@app.com'), (SELECT id_juego FROM juegos WHERE slug = 'toca-numero'), 'medio'),
((SELECT id_usuario FROM usuarios WHERE correo = 'eva@app.com'), (SELECT id_juego FROM juegos WHERE slug = 'ordena-secuencia'), 'facil'),
((SELECT id_usuario FROM usuarios WHERE correo = 'leo@app.com'), (SELECT id_juego FROM juegos WHERE slug = 'toca-numero'), 'facil')
ON CONFLICT (id_estudiante, id_juego) DO NOTHING;

-- Rellenar Resultados de partidas (Aquí sí queremos duplicados, así que NO usamos ON CONFLICT)
INSERT INTO resultados_juegos (id_estudiante, id_juego, puntuacion, tiempo_segundos, dificultad_jugada)
VALUES
((SELECT id_usuario FROM usuarios WHERE correo = 'eva@app.com'), (SELECT id_juego FROM juegos WHERE slug = 'toca-numero'), 100, 45, 'medio'),
((SELECT id_usuario FROM usuarios WHERE correo = 'leo@app.com'), (SELECT id_juego FROM juegos WHERE slug = 'toca-numero'), 80, 60, 'facil');