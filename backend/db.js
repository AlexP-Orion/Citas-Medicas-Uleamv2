const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'auth-db634.hstgr.io',          
  user: 'u599795228_user43',
  password: '6Bg325-1',
  database: 'u599795228_db43'
});

connection.connect((err) => {
  if (err) {
    console.error('Error de conexión:', err);
    return;
  }
  console.log('Conexión a MySQL exitosa.');
});

module.exports = connection;
