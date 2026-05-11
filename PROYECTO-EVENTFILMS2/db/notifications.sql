CREATE TABLE IF NOT EXISTS notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT DEFAULT NULL, -- NULL means global notification
    mensaje TEXT NOT NULL,
    leido TINYINT(1) DEFAULT 0,
    tipo ENUM('Global', 'Específica', 'Automática') DEFAULT 'Específica',
    prioridad ENUM('Baja', 'Media', 'Alta') DEFAULT 'Media',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES personal_total(id) ON DELETE CASCADE
);
