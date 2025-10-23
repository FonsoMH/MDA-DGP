-- ========= CUSTOM TYPES =========

CREATE TYPE IF NOT EXISTS difficulty_level AS ENUM (
    'facil',  -- Kept Spanish data as requested by enum definition
    'medio', 
    'dificil'
);

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
    background_color VARCHAR(7) DEFAULT '#D9D9D9',
    foreground_color VARCHAR(7) DEFAULT '#000000',
    icon_position VARCHAR(10) DEFAULT 'izquierda' CHECK (icon_position IN ('izquierda', 'derecha')),
    high_contrast_mode BOOLEAN DEFAULT false,
    show_numbers_mode BOOLEAN DEFAULT true, 
    font_size INTEGER DEFAULT 16 CHECK (font_size > 8)
);

-- Student Game Configuration (PIVOT Table)
CREATE TABLE IF NOT EXISTS student_game_configuration (
    student_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    difficulty difficulty_level NOT NULL DEFAULT 'facil',
    
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
    
    played_difficulty difficulty_level NOT NULL 
);

-- Indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_assigned_teacher ON users(assigned_teacher_id);
CREATE INDEX IF NOT EXISTS idx_game_results_student ON game_results(student_id);
CREATE INDEX IF NOT EXISTS idx_game_results_game ON game_results(game_id);


-- ========= INITIAL DATA POPULATION =========
-- Using 'ON CONFLICT DO NOTHING' to make the script idempotent

-- Populate Roles
INSERT INTO roles (role_name) VALUES
('student'),
('teacher'),
('admin')
ON CONFLICT (role_name) DO NOTHING;

-- Populate Games (Game names/descriptions remain in Spanish as they are content)
INSERT INTO games (slug, name, description) VALUES
('toca-numero', 'Toca el número que suena', 'Se escucha un número y se escoge el correspondiente de entre los mostrados en pantalla.'),
('ordena-secuencia', 'Ordena la secuencia', 'Se muestra una fila con números desordenados y hay que colocarlos ordenados.'),
('reparte-igual', 'Reparte el mismo número', 'Mover objetos/bolas a recipientes para que todos tengan la misma cantidad (suma).'),
('deja-igual', 'Deja el mismo número', 'Sacar objetos/bolas de recipientes para que todos tengan la misma cantidad (resta).')
ON CONFLICT (slug) DO NOTHING;

-- Populate Users (with English placeholder names)
INSERT INTO users (name, email, password_hash, role_id) 
VALUES ('Anne Admin', 'admin@app.com', 'fake_hash_123', (SELECT role_id FROM roles WHERE role_name = 'admin'))
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password_hash, role_id) 
VALUES ('Professor Paul', 'paul@app.com', 'fake_hash_123', (SELECT role_id FROM roles WHERE role_name = 'teacher'))
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password_hash, role_id, assigned_teacher_id) 
VALUES 
('Eva Student', 'eva@app.com', 'fake_hash_123', (SELECT role_id FROM roles WHERE role_name = 'student'), (SELECT user_id FROM users WHERE email = 'paul@app.com')),
('Leo Reader', 'leo@app.com', 'fake_hash_123', (SELECT role_id FROM roles WHERE role_name = 'student'), (SELECT user_id FROM users WHERE email = 'paul@app.com'))
ON CONFLICT (email) DO NOTHING;

-- Populate Settings for 1 student (Eva)
INSERT INTO accessibility_settings (student_id, high_contrast_mode, font_size, icon_position)
SELECT user_id, true, 20, 'derecha' FROM users WHERE email = 'eva@app.com'
ON CONFLICT (student_id) DO NOTHING;

-- Populate Configurations (Teacher assigns difficulty)
INSERT INTO student_game_configuration (student_id, game_id, difficulty)
VALUES
((SELECT user_id FROM users WHERE email = 'eva@app.com'), (SELECT game_id FROM games WHERE slug = 'toca-numero'), 'medio'),
((SELECT user_id FROM users WHERE email = 'eva@app.com'), (SELECT game_id FROM games WHERE slug = 'ordena-secuencia'), 'facil'),
((SELECT user_id FROM users WHERE email = 'leo@app.com'), (SELECT game_id FROM games WHERE slug = 'toca-numero'), 'facil')
ON CONFLICT (student_id, game_id) DO NOTHING;

-- Populate Game Results (We want duplicates here, so NO ON CONFLICT)
INSERT INTO game_results (student_id, game_id, score, time_seconds, played_difficulty)
VALUES
((SELECT user_id FROM users WHERE email = 'eva@app.com'), (SELECT game_id FROM games WHERE slug = 'toca-numero'), 100, 45, 'medio'),
((SELECT user_id FROM users WHERE email = 'leo@app.com'), (SELECT game_id FROM games WHERE slug = 'toca-numero'), 80, 60, 'facil');
