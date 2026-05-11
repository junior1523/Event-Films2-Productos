CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    roles JSON NOT NULL,
    personal_id INT DEFAULT NULL,
    specialty VARCHAR(255) DEFAULT NULL,
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (personal_id) REFERENCES personal_total(id) ON DELETE SET NULL
);

-- Seed initial users if not present
INSERT IGNORE INTO usuarios (id, username, password, roles, nombres, apellidos, email) 
VALUES (1, 'admin', 'admin', '["admin"]', 'Admin', 'EventFilms', 'admin@eventfilms.com');

INSERT IGNORE INTO usuarios (id, username, password, roles, specialty, nombres, apellidos, email) 
VALUES (2, 'editor', 'editor123', '["personal"]', 'Editor', 'María', 'Santos', 'maria@eventfilms.com');
