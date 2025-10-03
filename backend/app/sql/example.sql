

CREATE TABLE IF NOT EXISTS test_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    score INT DEFAULT 0
);

INSERT INTO test_table (name, score) VALUES ('Alice', 10);
INSERT INTO test_table (name, score) VALUES ('Bob', 7);
