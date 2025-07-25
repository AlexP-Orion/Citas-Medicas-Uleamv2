const express = require('express');
const router = express.Router();
const db = require('../db');

// Registro de usuario
router.post('/register', (req, res) => {
  const { cedula, nombre, password } = req.body;

  if (!cedula || !nombre || !password) {
    return res.json({ success: false, message: 'Todos los campos son obligatorios.' });
  }

  db.query('SELECT * FROM usuarios WHERE cedula = ?', [cedula], (err, results) => {
    if (results.length > 0) {
      return res.json({ success: false, message: 'El usuario ya existe.' });
    }

    db.query(
      'INSERT INTO usuarios (cedula, nombre, password) VALUES (?, ?, ?)',
      [cedula, nombre, password],
      (err, result) => {
        if (err) {
          return res.json({ success: false, message: 'Error en el servidor.' });
        }
        res.json({ success: true });
      }
    );
  });
});

// Login
router.post('/login', (req, res) => {
  const { cedula, password } = req.body;

  db.query('SELECT * FROM usuarios WHERE cedula = ? AND password = ?', [cedula, password], (err, results) => {
    if (err || results.length === 0) {
      return res.json({ success: false, message: 'Cédula o contraseña incorrecta.' });
    }
    res.json({ success: true, nombre: results[0].nombre });
  });
});

module.exports = router;
