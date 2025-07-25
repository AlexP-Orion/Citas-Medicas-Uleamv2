document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm'); // <- usa el id correcto

  if (!form) {
    console.error('No se encontró el formulario con id "loginForm".');
    return;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const cedula = document.getElementById('cedulaLogin').value;
    const password = document.getElementById('passwordLogin').value;

    try {
      const response = await fetch('https://citas-backend-5e65.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula, password })
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = 'calendario.html';
      } else {
        alert('Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Error en el servidor');
    }
  });
});
