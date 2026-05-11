import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "eventfilms",
  waitForConnections: true,
  connectionLimit: 10,
});

// ─── EDITORES (BACKWARD COMPATIBILITY) ─────────────────────────────────────────
app.get("/api/editores", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nombre FROM editores");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener editores" });
  }
});

// ─── EVENTOS (EDICIONES) ──────────────────────────────────────────────────────
app.get("/api/eventos", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.id, e.nombre AS evento, c.nombre AS cliente,
             ed.nombre AS editor, e.fecha_inicio AS fechaInicio,
             e.fecha_entrega AS fechaEntrega, e.progreso, e.estado,
             e.prioridad, e.duracion_estimada AS duracionEstimada,
             e.lugar, e.archivo_nombre AS nombreArchivo,
             e.tipo_evento AS tipo
      FROM eventos e
      LEFT JOIN clientes c ON c.id = e.cliente_id
      LEFT JOIN editores ed ON ed.id = e.editor_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener eventos" });
  }
});

app.post("/api/eventos", async (req, res) => {
  const { 
    nombre, cliente_id, tipo_evento, lugar, 
    fecha_inicio, fecha_entrega, estado, prioridad 
  } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO eventos (nombre, cliente_id, tipo_evento, lugar, fecha_inicio, fecha_entrega, estado, prioridad)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, cliente_id || null, tipo_evento || 'Evento Social', lugar || 'Por definir', fecha_inicio, fecha_entrega, estado || 'Sin Iniciar', prioridad || 'Media']
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear evento" });
  }
});

app.put("/api/eventos/:id", async (req, res) => {
  const { id } = req.params;
  const {
    estado, prioridad, progreso, editor_id,
    lugar, archivo_nombre, duracion_estimada,
    revision_audio, revision_color, revision_final,
    fecha_edicion_inicio, fecha_edicion_fin,
    capitulos, tiempo_total_horas, tiempo_total_minutos,
    trailer_estado, fotos_bruto_cantidad, fotos_bruto_formato,
    fotos_editadas_cantidad, fotos_editadas_listas, fotos_editadas_formato,
    observaciones, entrega_medio, usb_size, usb_cantidad,
    dvd_count, bluray_count, otros_entrega,
    estado_entrega_final, estado_entrega_final_otros,
  } = req.body;

  try {
    await pool.query(
      `UPDATE eventos SET
        estado = ?, prioridad = ?, progreso = ?, editor_id = ?,
        lugar = ?, archivo_nombre = ?, duracion_estimada = ?,
        revision_audio = ?, revision_color = ?, revision_final = ?,
        fecha_edicion_inicio = ?, fecha_edicion_fin = ?,
        capitulos = ?, tiempo_total_horas = ?, tiempo_total_minutos = ?,
        trailer_estado = ?, fotos_bruto_cantidad = ?, fotos_bruto_formato = ?,
        fotos_editadas_cantidad = ?, fotos_editadas_listas = ?, fotos_editadas_formato = ?,
        observaciones = ?, entrega_medio = ?, usb_size = ?, usb_cantidad = ?,
        dvd_count = ?, bluray_count = ?, otros_entrega = ?,
        estado_entrega_final = ?, estado_entrega_final_otros = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        estado, prioridad, progreso, editor_id || null,
        lugar, archivo_nombre, duracion_estimada,
        revision_audio ? 1 : 0, revision_color ? 1 : 0, revision_final ? 1 : 0,
        fecha_edicion_inicio || null, fecha_edicion_fin || null,
        capitulos ?? 0, tiempo_total_horas ?? 0, tiempo_total_minutos ?? 0,
        trailer_estado, fotos_bruto_cantidad ?? 0, fotos_bruto_formato ?? "",
        fotos_editadas_cantidad ?? 0, fotos_editadas_listas ? 1 : 0, fotos_editadas_formato ?? "",
        observaciones ?? "", entrega_medio, usb_size ?? "", usb_cantidad ?? 0,
        dvd_count ?? 0, bluray_count ?? 0, otros_entrega ?? "",
        estado_entrega_final, estado_entrega_final_otros ?? "",
        id,
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar evento" });
  }
});

app.delete("/api/eventos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM evento_almacenamiento WHERE evento_id = ?", [req.params.id]);
    await pool.query("DELETE FROM eventos WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar evento" });
  }
});

// ─── CONTRATOS ────────────────────────────────────────────────────────────────
app.get("/api/contratos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM contratos");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener contratos" });
  }
});

app.post("/api/contratos", async (req, res) => {
  const { 
    apellidos_nombres, dni, telefono, tipo_evento, tipo_evento_otro,
    nombre_evento, direccion, fecha_inicio, fecha_fin,
    rango_filmacion, plan_pagos, observaciones, estado, fecha_creacion
  } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO contratos (apellidos_nombres, dni, telefono, tipo_evento, tipo_evento_otro,
        nombre_evento, direccion, fecha_inicio, fecha_fin, rango_filmacion, plan_pagos,
        observaciones, estado, fecha_creacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        apellidos_nombres, dni, telefono, tipo_evento, tipo_evento_otro || null,
        nombre_evento, direccion, fecha_inicio, fecha_fin,
        JSON.stringify(rango_filmacion || []), JSON.stringify(plan_pagos || []),
        observaciones, estado || 'Pendiente', fecha_creacion
      ]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear contrato" });
  }
});

app.put("/api/contratos/:id", async (req, res) => {
  const { id } = req.params;
  const { 
    apellidos_nombres, dni, telefono, tipo_evento, tipo_evento_otro,
    nombre_evento, direccion, fecha_inicio, fecha_fin,
    rango_filmacion, plan_pagos, observaciones, estado
  } = req.body;
  try {
    await pool.query(
      `UPDATE contratos SET apellidos_nombres=?, dni=?, telefono=?, tipo_evento=?, tipo_evento_otro=?,
        nombre_evento=?, direccion=?, fecha_inicio=?, fecha_fin=?, rango_filmacion=?, plan_pagos=?,
        observaciones=?, estado=?, updated_at=NOW()
       WHERE id=?`,
      [
        apellidos_nombres, dni, telefono, tipo_evento, tipo_evento_otro || null,
        nombre_evento, direccion, fecha_inicio, fecha_fin,
        JSON.stringify(rango_filmacion || []), JSON.stringify(plan_pagos || []),
        observaciones, estado, id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar contrato" });
  }
});

app.delete("/api/contratos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM contratos WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar contrato" });
  }
});

// ─── PERSONAL (TOTAL) ──────────────────────────────────────────────────────────
app.get("/api/personal", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM personal_total");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener personal" });
  }
});

app.post("/api/personal", async (req, res) => {
  const { 
    nombres, apellidos, edad, dni, telefono, direccion, fecha_nacimiento,
    especialidades, adicional, rol, email, disponibilidad
  } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO personal_total (nombres, apellidos, edad, dni, telefono, direccion, fecha_nacimiento,
        especialidades, adicional, rol, email, disponibilidad)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombres, apellidos, edad, dni, telefono, direccion, fecha_nacimiento,
        JSON.stringify(especialidades || []), adicional, rol, email, disponibilidad
      ]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Error al crear personal" });
  }
});

app.put("/api/personal/:id", async (req, res) => {
  const { id } = req.params;
  const { 
    nombres, apellidos, edad, dni, telefono, direccion, fecha_nacimiento,
    especialidades, adicional, rol, email, disponibilidad, calificacion
  } = req.body;
  try {
    await pool.query(
      `UPDATE personal_total SET nombres=?, apellidos=?, edad=?, dni=?, telefono=?, direccion=?, 
        fecha_nacimiento=?, especialidades=?, adicional=?, rol=?, email=?, disponibilidad=?, 
        calificacion=?, updated_at=NOW()
       WHERE id=?`,
      [
        nombres, apellidos, edad, dni, telefono, direccion, fecha_nacimiento,
        JSON.stringify(especialidades || []), adicional, rol, email, disponibilidad,
        calificacion, id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar personal" });
  }
});

app.delete("/api/personal/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM personal_total WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar personal" });
  }
});

// ─── PAGOS ────────────────────────────────────────────────────────────────────
app.get("/api/pagos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM pagos");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener pagos" });
  }
});

app.post("/api/pagos", async (req, res) => {
  const { contrato_id, cliente, evento, monto, tipo, metodo, fecha, estado, fecha_vencimiento } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO pagos (contrato_id, cliente, evento, monto, tipo, metodo, fecha, estado, fecha_vencimiento)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [contrato_id || null, cliente, evento, monto, tipo, metodo, fecha, estado, fecha_vencimiento || null]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Error al registrar pago" });
  }
});

app.put("/api/pagos/:id", async (req, res) => {
  const { id } = req.params;
  const { cliente, evento, monto, tipo, metodo, fecha, estado, fecha_vencimiento } = req.body;
  try {
    await pool.query(
      `UPDATE pagos SET cliente=?, evento=?, monto=?, tipo=?, metodo=?, fecha=?, estado=?, 
        fecha_vencimiento=?, updated_at=NOW()
       WHERE id=?`,
      [cliente, evento, monto, tipo, metodo, fecha, estado, fecha_vencimiento || null, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar pago" });
  }
});

app.delete("/api/pagos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM pagos WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar pago" });
  }
});

// ─── ALMACENAMIENTOS ──────────────────────────────────────────────────────────
app.get("/api/almacenamientos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nombre, tamano, condiciones FROM almacenamientos");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener almacenamientos" });
  }
});

app.post("/api/almacenamientos", async (req, res) => {
  const { nombre, tamano, condiciones } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO almacenamientos (nombre, tamano, condiciones) VALUES (?, ?, ?)",
      [nombre, tamano, condiciones]
    );
    res.json({ id: result.insertId, nombre, tamano, condiciones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear almacenamiento" });
  }
});

app.put("/api/almacenamientos/:id", async (req, res) => {
  const { nombre, tamano, condiciones } = req.body;
  try {
    await pool.query(
      "UPDATE almacenamientos SET nombre=?, tamano=?, condiciones=?, updated_at=NOW() WHERE id=?",
      [nombre, tamano, condiciones, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar almacenamiento" });
  }
});

app.delete("/api/almacenamientos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM almacenamientos WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar almacenamiento" });
  }
});

// ─── EVENTO_ALMACENAMIENTO ────────────────────────────────────────────────────
app.get("/api/evento_almacenamiento", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ea.id, e.nombre AS evento, a.nombre AS almacen,
             ea.fecha_asignacion AS fecha, ea.notas
      FROM evento_almacenamiento ea
      JOIN eventos e ON e.id = ea.evento_id
      JOIN almacenamientos a ON a.id = ea.almacenamiento_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener designaciones" });
  }
});

app.post("/api/evento_almacenamiento", async (req, res) => {
  const { evento_id, almacenamiento_id, fecha_asignacion, notas } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO evento_almacenamiento (evento_id, almacenamiento_id, fecha_asignacion, notas) VALUES (?, ?, ?, ?)",
      [evento_id, almacenamiento_id, fecha_asignacion, notas || ""]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al designar evento" });
  }
});

app.delete("/api/evento_almacenamiento/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM evento_almacenamiento WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar designacion" });
  }
});

// ─── NOTIFICACIONES ──────────────────────────────────────────────────────────
app.get("/api/notificaciones", async (req, res) => {
  const { usuario_id, all } = req.query;
  try {
    let query = "SELECT * FROM notificaciones";
    let params = [];
    
    if (all === 'true') {
      // Return all notifications (for admin log)
      query += " WHERE 1=1";
    } else {
      query += " WHERE usuario_id IS NULL";
      if (usuario_id) {
        query += " OR usuario_id = ?";
        params.push(usuario_id);
      }
    }
    
    query += " ORDER BY created_at DESC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
});

app.post("/api/notificaciones", async (req, res) => {
  const { usuario_id, mensaje, tipo, prioridad } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO notificaciones (usuario_id, mensaje, tipo, prioridad) VALUES (?, ?, ?, ?)",
      [usuario_id || null, mensaje, tipo || 'Específica', prioridad || 'Media']
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Error al crear notificación" });
  }
});

app.put("/api/notificaciones/:id/read", async (req, res) => {
  try {
    await pool.query("UPDATE notificaciones SET leido = 1 WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar notificación" });
  }
});

app.delete("/api/notificaciones/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM notificaciones WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar notificación" });
  }
});

// ─── USUARIOS ────────────────────────────────────────────────────────────────
app.get("/api/usuarios", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios");
    // Parse roles JSON
    const mapped = rows.map(r => ({
      ...r,
      roles: typeof r.roles === 'string' ? JSON.parse(r.roles) : r.roles,
      personalId: r.personal_id // map for frontend
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

app.post("/api/usuarios", async (req, res) => {
  const { username, password, roles, personal_id, specialty, nombres, apellidos, email } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO usuarios (username, password, roles, personal_id, specialty, nombres, apellidos, email) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, password, JSON.stringify(roles || []), personal_id || null, specialty || null, nombres, apellidos, email]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

app.put("/api/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { username, password, roles, personal_id, specialty, nombres, apellidos, email } = req.body;
  try {
    await pool.query(
      `UPDATE usuarios SET username=?, password=?, roles=?, personal_id=?, specialty=?, 
       nombres=?, apellidos=?, email=?, updated_at=NOW() WHERE id=?`,
      [username, password, JSON.stringify(roles || []), personal_id || null, specialty || null, nombres, apellidos, email, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

app.delete("/api/usuarios/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM usuarios WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ API server corriendo en http://localhost:${PORT}`);
});
