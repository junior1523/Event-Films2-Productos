-- PostgreSQL database schema for the EventFilms project
-- Use: psql -d your_database -f db/schema.sql

CREATE TYPE tipo_evento AS ENUM ('Boda', 'Evento Corporativo', 'Evento social', 'Otro');
CREATE TYPE estado_evento AS ENUM ('Sin Iniciar', 'En Proceso', 'Revisión', 'Completado', 'Entregado');
CREATE TYPE prioridad_tipo AS ENUM ('Alta', 'Media', 'Baja');
CREATE TYPE trailer_estado AS ENUM ('Listo', 'Proceso', 'No iniciado');
CREATE TYPE entrega_medio AS ENUM ('USB', 'DVD', 'BLURAY', 'OTROS');
CREATE TYPE estado_entrega_final AS ENUM ('Listo', 'En proceso', 'No iniciado', 'Otros');

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE editores (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    especialidad TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE almacenamientos (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    tamano TEXT NOT NULL,
    condiciones TEXT NOT NULL,
    ubicacion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    observaciones TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE eventos (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    tipo_evento tipo_evento NOT NULL,
    lugar TEXT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_entrega DATE NOT NULL,
    duracion_estimada TEXT,
    estado estado_evento NOT NULL DEFAULT 'Sin Iniciar',
    prioridad prioridad_tipo NOT NULL DEFAULT 'Media',
    editor_id INT REFERENCES editores(id) ON DELETE SET NULL,
    progreso SMALLINT NOT NULL DEFAULT 0,
    archivo_nombre TEXT,
    datos_adicionales TEXT,
    revision_audio BOOLEAN NOT NULL DEFAULT FALSE,
    revision_color BOOLEAN NOT NULL DEFAULT FALSE,
    revision_final BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_edicion_inicio DATE,
    fecha_edicion_fin DATE,
    capitulos INT NOT NULL DEFAULT 0,
    tiempo_total_horas INT NOT NULL DEFAULT 0,
    tiempo_total_minutos INT NOT NULL DEFAULT 0,
    trailer_estado trailer_estado NOT NULL DEFAULT 'No iniciado',
    fotos_bruto_cantidad INT NOT NULL DEFAULT 0,
    fotos_bruto_formato TEXT,
    fotos_editadas_cantidad INT NOT NULL DEFAULT 0,
    fotos_editadas_listas BOOLEAN NOT NULL DEFAULT FALSE,
    fotos_editadas_formato TEXT,
    observaciones TEXT,
    entrega_medio entrega_medio NOT NULL DEFAULT 'USB',
    usb_size TEXT,
    usb_cantidad INT NOT NULL DEFAULT 0,
    dvd_count INT NOT NULL DEFAULT 0,
    bluray_count INT NOT NULL DEFAULT 0,
    otros_entrega TEXT,
    estado_entrega_final estado_entrega_final NOT NULL DEFAULT 'En proceso',
    estado_entrega_final_otros TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE evento_almacenamiento (
    id SERIAL PRIMARY KEY,
    evento_id INT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    almacenamiento_id INT NOT NULL REFERENCES almacenamientos(id) ON DELETE RESTRICT,
    fecha_asignacion DATE NOT NULL DEFAULT CURRENT_DATE,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (evento_id, almacenamiento_id)
);

CREATE INDEX idx_eventos_cliente_id ON eventos(cliente_id);
CREATE INDEX idx_eventos_editor_id ON eventos(editor_id);
CREATE INDEX idx_eventos_estado ON eventos(estado);
CREATE INDEX idx_eventos_prioridad ON eventos(prioridad);
CREATE INDEX idx_evento_almacenamiento_evento_id ON evento_almacenamiento(evento_id);
CREATE INDEX idx_evento_almacenamiento_almacenamiento_id ON evento_almacenamiento(almacenamiento_id);

CREATE ROLE web_anon NOLOGIN;
GRANT USAGE ON SCHEMA public TO web_anon;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO web_anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO web_anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO web_anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO web_anon;

CREATE VIEW vw_evento_detalles AS
SELECT
  e.id AS evento_id,
  e.nombre AS evento_nombre,
  c.nombre AS cliente_nombre,
  e.tipo_evento,
  e.lugar,
  e.fecha_inicio,
  e.fecha_entrega,
  e.estado,
  e.prioridad,
  ed.nombre AS editor_nombre,
  e.progreso,
  e.archivo_nombre,
  e.revision_audio,
  e.revision_color,
  e.revision_final,
  e.fecha_edicion_inicio,
  e.fecha_edicion_fin,
  e.capitulos,
  e.tiempo_total_horas,
  e.tiempo_total_minutos,
  e.trailer_estado,
  e.fotos_bruto_cantidad,
  e.fotos_bruto_formato,
  e.fotos_editadas_cantidad,
  e.fotos_editadas_listas,
  e.fotos_editadas_formato,
  e.entrega_medio,
  e.usb_size,
  e.usb_cantidad,
  e.dvd_count,
  e.bluray_count,
  e.otros_entrega,
  e.estado_entrega_final
FROM eventos e
LEFT JOIN clientes c ON c.id = e.cliente_id
LEFT JOIN editores ed ON ed.id = e.editor_id;
