-- MySQL database schema for the EventFilms project updated for full persistence
-- Use: mysql -u your_user -p your_database < db/schema_mysql.sql

CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS editores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(255),
    especialidad VARCHAR(255),
    activo TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS almacenamientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tamano VARCHAR(255) NOT NULL,
    condiciones VARCHAR(255) NOT NULL,
    ubicacion VARCHAR(255),
    activo TINYINT(1) NOT NULL DEFAULT 1,
    observaciones TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS personal_total (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    edad INT,
    dni VARCHAR(20),
    telefono VARCHAR(50),
    direccion VARCHAR(255),
    fecha_nacimiento DATE,
    especialidades JSON,
    adicional TEXT,
    rol VARCHAR(50),
    email VARCHAR(255),
    disponibilidad VARCHAR(50),
    eventos_asignados INT DEFAULT 0,
    calificacion DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contratos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    apellidos_nombres VARCHAR(255) NOT NULL,
    dni VARCHAR(20),
    telefono VARCHAR(50),
    tipo_evento VARCHAR(50),
    tipo_evento_otro VARCHAR(255),
    nombre_evento VARCHAR(255) NOT NULL,
    direccion VARCHAR(255),
    fecha_inicio DATE,
    fecha_fin DATE,
    rango_filmacion JSON,
    plan_pagos JSON,
    observaciones TEXT,
    estado ENUM('Activo', 'Pendiente', 'Completado', 'Cancelado') DEFAULT 'Pendiente',
    fecha_creacion DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cliente_id INT,
    tipo_evento VARCHAR(100) NOT NULL,
    lugar VARCHAR(255) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_entrega DATE NOT NULL,
    duracion_estimada VARCHAR(255),
    estado ENUM('Sin Iniciar', 'En Proceso', 'Revisión', 'Completado', 'Entregado') NOT NULL DEFAULT 'Sin Iniciar',
    prioridad ENUM('Alta', 'Media', 'Baja') NOT NULL DEFAULT 'Media',
    editor_id INT,
    progreso SMALLINT NOT NULL DEFAULT 0,
    archivo_nombre VARCHAR(255),
    datos_adicionales TEXT,
    revision_audio TINYINT(1) NOT NULL DEFAULT 0,
    revision_color TINYINT(1) NOT NULL DEFAULT 0,
    revision_final TINYINT(1) NOT NULL DEFAULT 0,
    fecha_edicion_inicio DATE,
    fecha_edicion_fin DATE,
    capitulos INT NOT NULL DEFAULT 0,
    tiempo_total_horas INT NOT NULL DEFAULT 0,
    tiempo_total_minutos INT NOT NULL DEFAULT 0,
    trailer_estado ENUM('Listo', 'Proceso', 'No iniciado') NOT NULL DEFAULT 'No iniciado',
    fotos_bruto_cantidad INT NOT NULL DEFAULT 0,
    fotos_bruto_formato VARCHAR(255),
    fotos_editadas_cantidad INT NOT NULL DEFAULT 0,
    fotos_editadas_listas TINYINT(1) NOT NULL DEFAULT 0,
    fotos_editadas_formato VARCHAR(255),
    observaciones TEXT,
    entrega_medio ENUM('USB', 'DVD', 'BLURAY', 'OTROS') NOT NULL DEFAULT 'USB',
    usb_size VARCHAR(255),
    usb_cantidad INT NOT NULL DEFAULT 0,
    dvd_count INT NOT NULL DEFAULT 0,
    bluray_count INT NOT NULL DEFAULT 0,
    otros_entrega VARCHAR(255),
    estado_entrega_final ENUM('Listo', 'En proceso', 'No iniciado', 'Otros') NOT NULL DEFAULT 'En proceso',
    estado_entrega_final_otros VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
    FOREIGN KEY (editor_id) REFERENCES editores(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contrato_id INT,
    cliente VARCHAR(255),
    evento VARCHAR(255),
    monto DECIMAL(10,2),
    tipo ENUM('Anticipo', 'Pago Parcial', 'Pago Final'),
    metodo ENUM('Efectivo', 'Transferencia', 'Tarjeta'),
    fecha DATE,
    estado ENUM('Pagado', 'Pendiente', 'Vencido'),
    fecha_vencimiento DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS evento_almacenamiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    almacenamiento_id INT NOT NULL,
    fecha_asignacion DATE NOT NULL,
    notas TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (evento_id, almacenamiento_id),
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
    FOREIGN KEY (almacenamiento_id) REFERENCES almacenamientos(id) ON DELETE RESTRICT
);
