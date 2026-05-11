-- Seed data for EventFilms PostgreSQL schema
-- Use: psql -d your_database -f db/seed.sql

INSERT INTO clientes (nombre, tipo, email, telefono)
VALUES
  ('Ana Garcia', 'Cliente particular', 'ana.garcia@example.com', '+54 11 1234 5678'),
  ('Familia Rodriguez', 'Cliente particular', 'familia.rodriguez@example.com', '+54 11 8765 4321'),
  ('TechCo S.A.', 'Cliente corporativo', 'contacto@techco.com', '+54 11 9999 8888');

INSERT INTO editores (nombre, email, telefono, especialidad)
VALUES
  ('Maria Santos', 'maria.santos@example.com', '+54 11 1111 2222', 'Edicion de bodas y eventos sociales'),
  ('Patricia Gomez', 'patricia.gomez@example.com', '+54 11 3333 4444', 'Edicion corporativa'),
  ('Jorge Perez', 'jorge.perez@example.com', '+54 11 5555 6666', 'Postproduccion y color');

INSERT INTO almacenamientos (nombre, tamano, condiciones, ubicacion, observaciones)
VALUES
  ('Disco Azul', '2 TB', 'Activo, sin errores', 'Servidor A - Rack 1', 'Usado para eventos recientes'),
  ('Disco Verde', '4 TB', 'Respaldo programado', 'Servidor B - Rack 3', 'Respaldo semanal'),
  ('Disco Negro', '1 TB', 'En uso por edicion activa', 'Servidor C - Rack 2', 'Evento en curso');

INSERT INTO eventos (
  nombre, cliente_id, tipo_evento, lugar, fecha_inicio, fecha_entrega, duracion_estimada,
  estado, prioridad, editor_id, progreso, archivo_nombre, datos_adicionales,
  revision_audio, revision_color, revision_final, fecha_edicion_inicio, fecha_edicion_fin,
  capitulos, tiempo_total_horas, tiempo_total_minutos, trailer_estado,
  fotos_bruto_cantidad, fotos_bruto_formato, fotos_editadas_cantidad, fotos_editadas_listas,
  fotos_editadas_formato, observaciones, entrega_medio, usb_size, usb_cantidad,
  dvd_count, bluray_count, otros_entrega, estado_entrega_final, estado_entrega_final_otros
)
VALUES
  (
    'Boda Ana & Carlos',
    1,
    'Boda',
    'Salon Los Olivos',
    '2026-04-06',
    '2026-04-20',
    '45 min',
    'En Proceso',
    'Alta',
    1,
    75,
    'archivo_1.mp4',
    'Grabacion completa, requiere ajuste de color',
    TRUE,
    TRUE,
    FALSE,
    '2026-04-06',
    '2026-04-20',
    4,
    5,
    15,
    'Proceso',
    120,
    'RAW',
    48,
    FALSE,
    'JPEG',
    'Revisar audio final',
    'USB',
    '64GB',
    1,
    0,
    0,
    '',
    'En proceso',
    ''
  ),
  (
    'XV Anos Maria',
    2,
    'Evento social',
    'Salon Versalles',
    '2026-04-13',
    '2026-04-27',
    '30 min',
    'Sin Iniciar',
    'Media',
    2,
    0,
    'archivo_2.mp4',
    'Edicion planificada para la proxima semana',
    FALSE,
    FALSE,
    FALSE,
    '2026-04-13',
    '2026-04-27',
    3,
    4,
    0,
    'No iniciado',
    80,
    'RAW',
    0,
    FALSE,
    'JPEG',
    'Falta organizar fotos del evento',
    'USB',
    '32GB',
    0,
    0,
    0,
    '',
    'En proceso',
    ''
  ),
  (
    'Evento Corporativo TechCo',
    3,
    'Evento Corporativo',
    'Centro de Convenciones',
    '2026-04-16',
    '2026-04-23',
    '20 min',
    'Revisión',
    'Alta',
    3,
    90,
    'archivo_3.mp4',
    'Entrega prioritizada para cliente corporativo',
    TRUE,
    TRUE,
    TRUE,
    '2026-04-16',
    '2026-04-23',
    5,
    6,
    30,
    'Proceso',
    200,
    'RAW',
    90,
    FALSE,
    'JPEG',
    'Revision final de subtitulos still pendiente',
    'USB',
    '128GB',
    0,
    0,
    0,
    '',
    'En proceso',
    ''
  );

INSERT INTO evento_almacenamiento (evento_id, almacenamiento_id, fecha_asignacion, notas)
VALUES
  (1, 1, '2026-04-06', 'Asignado a Disco Azul para edicion en curso'),
  (3, 2, '2026-04-16', 'Asignado a Disco Verde como respaldo corporativo');
