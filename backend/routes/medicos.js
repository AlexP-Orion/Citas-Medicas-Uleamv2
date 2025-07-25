const express = require('express');
const router = express.Router();
const db = require('../db');

// Ruta: obtener todos los médicos
router.get('/todos', (req, res) => {
  const sql = `
    SELECT m.id, m.nombre, e.nombre AS especialidad
    FROM medicos m
    JOIN especialidades e ON m.especialidad_id = e.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error cargando médicos' });
    res.json(results);
  });
});


// Ruta: obtener especialidades
router.get('/especialidades', (req, res) => {
  db.query('SELECT * FROM especialidades', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error cargando especialidades' });
    res.json(results);
  });
});

// Ruta: obtener médicos según especialidad
router.get('/:especialidad_id', (req, res) => {
  const id = req.params.especialidad_id;
  db.query('SELECT * FROM medicos WHERE especialidad_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error cargando médicos' });
    res.json(results);
  });
});

// Ruta: disponibilidad del médico
router.get('/disponibilidad/:medico_id', (req, res) => {
  const id = req.params.medico_id;
  db.query('SELECT dia_semana, hora FROM disponibilidad WHERE medico_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error cargando disponibilidad' });

    const agrupado = {};
    results.forEach(({ dia_semana, hora }) => {
      if (!agrupado[dia_semana]) agrupado[dia_semana] = [];
      agrupado[dia_semana].push(hora);
    });

    res.json(agrupado);
  });
});

module.exports = router;
