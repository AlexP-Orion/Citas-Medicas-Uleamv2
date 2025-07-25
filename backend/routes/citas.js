const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/ocupadas/:medicoId/:fecha', (req, res) => {
  const { medicoId, fecha } = req.params;
  const sql = `
    SELECT hora
    FROM citas
    WHERE medico_id = ? AND dia = ?
  `;
  db.query(sql, [medicoId, fecha], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error consultando horas ocupadas' });
    const horas = results.map(r => r.hora); // '09:00:00'
    res.json(horas);
  });
});

router.get('/usuario/:cedula', (req, res) => {
  const { cedula } = req.params;

  const sql = `
    SELECT 
      c.id,
      c.dia,
      c.hora,
      c.motivo,
      e.nombre AS especialidad,
      m.nombre AS medico
    FROM citas c
    JOIN medicos m ON c.medico_id = m.id
    JOIN especialidades e ON m.especialidad_id = e.id
    WHERE c.usuario_cedula = ?
  `;

  db.query(sql, [cedula], (err, results) => {
    if (err) {
      console.error('Error al obtener citas:', err);
      return res.status(500).json({ error: 'Error al obtener citas del usuario' });
    }
    res.json(results);
  });
});

// PUT: actualizar cita
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { dia, hora } = req.body;

  if (!dia || !hora) {
    return res.status(400).json({ error: 'Fecha y hora obligatorias.' });
  }

  const sql = `UPDATE citas SET dia = ?, hora = ? WHERE id = ?`;
  db.query(sql, [dia, hora, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar:', err);
      return res.status(500).json({ error: 'Error al actualizar la cita.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada o sin cambios.' });
    }

    //console.log('Cita actualizada:', result);
    res.json({ message: 'Cita actualizada correctamente' });
  });
});

// DELETE: eliminar cita
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM citas WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar cita:', err);
      return res.status(500).json({ error: 'Error al eliminar la cita.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada para eliminar.' });
    }

    res.json({ message: 'Cita cancelada correctamente' });
  });
});


router.post('/agendar', (req, res) => {
  const {
    cedula,
    nombre,
    especialidad,
    medico_id,
    dia,
    hora,
    motivo
  } = req.body;

  if (!cedula || !nombre || !especialidad || !medico_id || !dia || !hora || !motivo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const sql = `
    INSERT INTO citas (
      usuario_cedula,
      usuario_nombre,
      especialidad,
      medico_id,
      dia,
      hora,
      motivo
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [cedula, nombre, especialidad, medico_id, dia, hora, motivo], (err, result) => {
    if (err) {
      console.error('Error al insertar cita:', err);
      return res.status(500).json({ error: 'Error al agendar cita' });
    }

    res.json({ message: 'Cita agendada correctamente' });
  });
});

module.exports = router;
