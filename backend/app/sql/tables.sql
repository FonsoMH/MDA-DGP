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
    background_color VARCHAR(9) DEFAULT '#F7F8FA',
    foreground_color VARCHAR(9) DEFAULT '#000000',
    container_color VARCHAR(9) DEFAULT '#FFFFFF',
    number_color VARCHAR(9) DEFAULT '#000000', 
    box_color VARCHAR(9) DEFAULT '#D9D9D9', 
    icon_position VARCHAR(10) DEFAULT 'izquierda' CHECK (icon_position IN ('izquierda', 'derecha')),
    show_numbers_mode BOOLEAN DEFAULT true, 
    font_size INTEGER DEFAULT 16 CHECK (font_size > 8)
);

-- Student Game Configuration (PIVOT Table)
CREATE TABLE IF NOT EXISTS student_game_configuration (
    student_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    min_value INTEGER NOT NULL DEFAULT 0,
    max_value INTEGER NOT NULL DEFAULT 10,
    num_elements INTEGER NOT NULL DEFAULT 5,
    num_containers INTEGER NOT NULL DEFAULT 2,
    upward BOOLEAN NOT NULL DEFAULT true,
    sum BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (student_id, game_id)
);

-- Game Results
CREATE TABLE IF NOT EXISTS game_results (
    result_id SERIAL,
    student_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE RESTRICT,
    abandoned BOOLEAN NOT NULL DEFAULT false,
    successful_plays INTEGER NOT NULL,
    failed_plays INTEGER NOT NULL,

    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    time_seconds INTEGER NOT NULL,

    played_parameters JSONB NOT NULL, -- New column to store game parameters as JSONB for historical results

    PRIMARY KEY (student_id, game_id, played_at)
);

-- 
CREATE TABLE IF NOT EXISTS user_deletion (
    deletion_id SERIAL PRIMARY KEY,
    delete_admin_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    delete_user_id INTEGER NOT NULL,
    deleted_user_email VARCHAR(255),
    deleted_user_name VARCHAR(255),
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
('Eva Student', 'eva@app.com', 'scrypt:32768:8:1$rBvclRmeu1UqPMP6$ced8eefdf634683cf43a15afbb285b41b2e01fe80d8953ac3be17b4a03775aa743303010b41c971ce48231df15c40659062b41b9f47fd48b9117156a1ac9b1eb', (SELECT role_id FROM roles WHERE role_name = 'student'), (SELECT user_id FROM users WHERE email = 'paul@app.com')),
('Leo Reader', 'leo@app.com', 'scrypt:32768:8:1$HzRP2dGZaRn7HUUY$2faba6ea80ed475c04241e5e3079ad91889e21dd361e904e48c1b6182511cd77fa7622e9fe9d50aefa5639f6a70246fa9a50c1fcf7d1586d6c12f99b447f3c0d', (SELECT role_id FROM roles WHERE role_name = 'student'), (SELECT user_id FROM users WHERE email = 'paul@app.com'))
ON CONFLICT (email) DO NOTHING;

-- 4. Populate Settings for 1 student (Eva)
INSERT INTO accessibility_settings (student_id, font_size, icon_position)
SELECT user_id, 20, 'derecha' FROM users WHERE email = 'eva@app.com'
ON CONFLICT (student_id) DO NOTHING;

-- 5. Populate Configurations (Teacher assigns parameters)
-- Eva: 'toca-numero' (Game 1) -> Rango 20, 5 opciones, sin contenedores, etc.
-- Eva: 'ordena-secuencia' (Game 2) -> Rango 50, 4 elementos, orden ascendente.
-- Leo: 'reparte-igual' (Game 3) -> Rango 10 (suma total), 15 elementos, 3 contenedores, requiere suma.
INSERT INTO student_game_configuration (student_id, game_id, min_value, max_value, num_elements, num_containers, upward, sum)
VALUES
(
    (SELECT user_id FROM users WHERE email = 'eva@app.com'),
    (SELECT game_id FROM games WHERE slug = 'toca-numero'),
    10, 20, 5, 0, true, false
),
(
    (SELECT user_id FROM users WHERE email = 'eva@app.com'),
    (SELECT game_id FROM games WHERE slug = 'ordena-secuencia'),
    5, 50, 4, 0, true, false
),
(
    (SELECT user_id FROM users WHERE email = 'eva@app.com'),
    (SELECT game_id FROM games WHERE slug = 'reparte-igual'),
    0, 20, 5, 3, true, false
),
(
    (SELECT user_id FROM users WHERE email = 'eva@app.com'),
    (SELECT game_id FROM games WHERE slug = 'deja-igual'),
    0, 20, 5, 3, true, false
),
(
    (SELECT user_id FROM users WHERE email = 'leo@app.com'),
    (SELECT game_id FROM games WHERE slug = 'reparte-igual'),
    0, 10, 15, 3, true, true -- sum=true significa que 'reparte' (suma) está activo
)
ON CONFLICT (student_id, game_id) DO NOTHING;

-- 6. Populate Game Results (valid columns)
-- Inserta varias partidas para Eva Student en dos fechas distintas para pruebas de estadísticas
INSERT INTO game_results (student_id, game_id, abandoned, successful_plays, failed_plays, played_at, time_seconds, played_parameters)
VALUES
-- Eva en 'toca-numero' (día 2025-11-20)
(
    (SELECT user_id FROM users WHERE email = 'eva@app.com'),
    (SELECT game_id FROM games WHERE slug = 'toca-numero'),
    false, 3, 1,
    '2025-11-20T10:00:00+00:00',
    45,
    '{"ranges": 20, "num_elements": 5, "num_containers": 0, "upward": true, "sum": false}'
),
(
    (SELECT user_id FROM users WHERE email = 'eva@app.com'),
    (SELECT game_id FROM games WHERE slug = 'toca-numero'),
    true, 0, 0,
    '2025-11-20T12:15:00+00:00',
    30,
    '{"ranges": 20, "num_elements": 5, "num_containers": 0, "upward": true, "sum": false}'
),
-- Eva en 'toca-numero' (día 2025-11-21)
(
    (SELECT user_id FROM users WHERE email = 'eva@app.com'),
    (SELECT game_id FROM games WHERE slug = 'toca-numero'),
    false, 4, 2,
    '2025-11-21T09:30:00+00:00',
    60,
    '{"ranges": 20, "num_elements": 5, "num_containers": 0, "upward": true, "sum": false}'
),
(
    (SELECT user_id FROM users WHERE email = 'eva@app.com'),
    (SELECT game_id FROM games WHERE slug = 'toca-numero'),
    false, 2, 3,
    '2025-11-21T15:45:00+00:00',
    55,
    '{"ranges": 20, "num_elements": 5, "num_containers": 0, "upward": true, "sum": false}'
)
ON CONFLICT (student_id, game_id, played_at) DO NOTHING;