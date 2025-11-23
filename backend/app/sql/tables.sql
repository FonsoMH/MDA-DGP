-- ========= TABLE CREATION =========

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- Users Table (Central)
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    role_id INTEGER NOT NULL REFERENCES roles(role_id),
    
    -- Relationship Teacher -> Student (only for students)
    assigned_teacher_id INTEGER REFERENCES users(user_id) NULL
);

-- Games Table (Catalog)
CREATE TABLE IF NOT EXISTS games (
    game_id SERIAL PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Accessibility Settings (1-to-1 with Student)
CREATE TABLE IF NOT EXISTS accessibility_settings (
    student_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    background_color VARCHAR(7) DEFAULT '#F7F8FA',
    foreground_color VARCHAR(7) DEFAULT '#000000',
    number_color VARCHAR(7) DEFAULT '#000000', 
    box_color VARCHAR(7) DEFAULT '#D9D9D9', 
    icon_position VARCHAR(10) DEFAULT 'izquierda' CHECK (icon_position IN ('izquierda', 'derecha')),
    high_contrast_mode BOOLEAN DEFAULT false,
    show_numbers_mode BOOLEAN DEFAULT true, 
    font_size INTEGER DEFAULT 16 CHECK (font_size > 8)
);

-- Student Game Configuration (PIVOT Table)
CREATE TABLE IF NOT EXISTS student_game_configuration (
    student_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    ranges INTEGER NOT NULL DEFAULT 10,
    num_elements INTEGER NOT NULL DEFAULT 5,
    num_containers INTEGER NOT NULL DEFAULT 2,
    upward BOOLEAN NOT NULL DEFAULT true,
    sum BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (student_id, game_id)
);

-- Game Results
CREATE TABLE IF NOT EXISTS game_results (
    result_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE RESTRICT,
    
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    score INTEGER NOT NULL,
    time_seconds INTEGER NOT NULL,

    played_parameters JSONB NOT NULL -- New column to store game parameters as JSONB for historical results
);

-- 
CREATE TABLE IF NOT EXISTS user_deletion (
    deletion_id SERIAL PRIMARY KEY,
    delete_admin_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    delete_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    deleted_user_email VARCHAR(255),
    deleted_user_name VARCHAR(255),
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resources File Storage
CREATE TABLE IF NOT EXISTS resources (
    resource_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    type_id INTEGER NOT NULL REFERENCES resource_types(type_id),

    -- URL pública o prefirmada de Drive/S3
    storage_url TEXT NOT NULL,

    -- Metadatos del archivo
    file_format VARCHAR(10) NOT NULL,         
    file_size BIGINT NOT NULL,                
    mime_type VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resource Types Table
CREATE TABLE IF NOT EXISTS resource_types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,  -- image, pictogram, audio, video...
    is_default BOOLEAN DEFAULT FALSE
);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Resource-Tags Many-to-Many Relationship
CREATE TABLE IF NOT EXISTS resource_tags (
    resource_id INTEGER NOT NULL REFERENCES resources(resource_id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (resource_id, tag_id)
);

-- CREATE TABLE IF NOT EXISTS resource_usage (
--     usage_id SERIAL PRIMARY KEY,
--     resource_id INTEGER NOT NULL REFERENCES resources(resource_id) ON DELETE CASCADE,
--     TODO como vamos a trackear el uso?
--     referenced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_assigned_teacher ON users(assigned_teacher_id);
CREATE INDEX IF NOT EXISTS idx_game_results_student ON game_results(student_id);
CREATE INDEX IF NOT EXISTS idx_game_results_game ON game_results(game_id);

-- 1. Populate Roles
INSERT INTO roles (role_name) VALUES
('student'),
('teacher'),
('admin')
ON CONFLICT (role_name) DO NOTHING;

-- 2. Populate Games
INSERT INTO games (slug, name, description) VALUES
('toca-numero', 'Toca el número que suena', 'Se escucha un número y se escoge el correspondiente de entre los mostrados en pantalla.'),
('ordena-secuencia', 'Ordena la secuencia', 'Se muestra una fila con números desordenados y hay que colocarlos ordenados.'),
('reparte-igual', 'Reparte el mismo número', 'Mover objetos/bolas a recipientes para que todos tengan la misma cantidad (suma).'),
('deja-igual', 'Deja el mismo número', 'Sacar objetos/bolas de recipientes para que todos tengan la misma cantidad (resta).')
ON CONFLICT (slug) DO NOTHING;

-- 3. Populate Users
INSERT INTO users (name, email, password_hash, role_id) 
VALUES ('Anne Admin', 'admin@app.com', 'scrypt:32768:8:1$XwpRqEHq2gbnQsiX$29f6167d7863fb4f878d244e0306edce02ebde305a6c24d559d05f87304c7829ea96d4f34ed3928edbf77cedb751b4e5a9aaa73efe1bf2e44f8ce391affb1049', (SELECT role_id FROM roles WHERE role_name = 'admin'))
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password_hash, role_id) 
VALUES ('Professor Paul', 'paul@app.com', 'scrypt:32768:8:1$5IjCMocVblg07UqT$9ff5d3058a93e927c45f62a5658eaa251d14dde68a58ec84b0d2e928a060ed41d493f5e3d41c8122a8d773fcafe6e91b5c3a45301f57f6fce1bcdff417978ebe', (SELECT role_id FROM roles WHERE role_name = 'teacher'))
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password_hash, role_id, assigned_teacher_id) 
VALUES 
('Eva Student', 'eva@app.com', 'scrypt:32768:8:1$cqwOvGPYlW6TdyuQ$b1717df1f28a0d52b08fb2a1ee5599ddadd3e1a9c98be3d02accd368b1975ae1994c247a81da01ad4d89d606c6479c4f79032876a70d57af3fd8da343aab8e6a', (SELECT role_id FROM roles WHERE role_name = 'student'), (SELECT user_id FROM users WHERE email = 'paul@app.com')),
('Leo Reader', 'leo@app.com', 'fake_hash_123', (SELECT role_id FROM roles WHERE role_name = 'student'), (SELECT user_id FROM users WHERE email = 'paul@app.com'))
ON CONFLICT (email) DO NOTHING;

-- 4. Populate Settings for 1 student (Eva)
INSERT INTO accessibility_settings (student_id, high_contrast_mode, font_size, icon_position)
SELECT user_id, true, 20, 'derecha' FROM users WHERE email = 'eva@app.com'
ON CONFLICT (student_id) DO NOTHING;

-- 5. Populate Configurations (Teacher assigns parameters)
-- Eva: 'toca-numero' (Game 1) -> Rango 20, 5 opciones, sin contenedores, etc.
-- Eva: 'ordena-secuencia' (Game 2) -> Rango 50, 4 elementos, orden ascendente.
-- Leo: 'reparte-igual' (Game 3) -> Rango 10 (suma total), 15 elementos, 3 contenedores, requiere suma.
INSERT INTO student_game_configuration (student_id, game_id, ranges, num_elements, num_containers, upward, sum)
VALUES
(
    (SELECT user_id FROM users WHERE email = 'eva@app.com'),
    (SELECT game_id FROM games WHERE slug = 'toca-numero'),
    20, 5, 0, true, false
),
(
    (SELECT user_id FROM users WHERE email = 'eva@app.com'),
    (SELECT game_id FROM games WHERE slug = 'ordena-secuencia'),
    50, 4, 0, true, false
),
(
    (SELECT user_id FROM users WHERE email = 'leo@app.com'),
    (SELECT game_id FROM games WHERE slug = 'reparte-igual'),
    10, 15, 3, true, true -- sum=true significa que 'reparte' (suma) está activo
)
ON CONFLICT (student_id, game_id) DO UPDATE SET
    ranges = EXCLUDED.ranges,
    num_elements = EXCLUDED.num_elements,
    num_containers = EXCLUDED.num_containers,
    upward = EXCLUDED.upward,
    sum = EXCLUDED.sum;

-- 6. Populate Game Results (CON SNAPSHOT)
-- Inserta el resultado Y el JSONB con los parámetros de ese momento.
INSERT INTO game_results (student_id, game_id, score, time_seconds, played_parameters)
VALUES
(
    (SELECT user_id FROM users WHERE email = 'eva@app.com'),
    (SELECT game_id FROM games WHERE slug = 'toca-numero'),
    100, 45,
    -- Snapshot de la configuración de Eva para 'toca-numero' (Config 5)
    '{"ranges": 20, "num_elements": 5, "num_containers": 0, "upward": true, "sum": false}'
),
(
    (SELECT user_id FROM users WHERE email = 'leo@app.com'),
    (SELECT game_id FROM games WHERE slug = 'reparte-igual'),
    80, 120,
    -- Snapshot de la configuración de Leo para 'reparte-igual' (Config 5)
    '{"ranges": 10, "num_elements": 15, "num_containers": 3, "upward": true, "sum": true}'
);

