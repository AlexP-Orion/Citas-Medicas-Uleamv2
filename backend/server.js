const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const citasRoutes = require('./routes/citas');
const usuariosRoutes = require('./routes/usuarios');
const medicosRoutes = require('./routes/medicos');

app.use(cors());
app.use(express.json());

// Archivos estáticos desde /frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API de citas y usuarios
app.use('/api/citas', citasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/medicos', medicosRoutes);

// Ruta raíz: index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
