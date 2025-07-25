document.getElementById('formRegister').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombreRegister').value;
  const cedula = document.getElementById('cedulaRegister').value;
  const password = document.getElementById('passwordRegister').value;

  try {
    const response = await fetch('https://citas-backend-5e65.onrender.com/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, cedula, password })
    });

    const data = await response.json();

    if (data.success) {
      alert('Usuario registrado correctamente');
      window.location.href = 'login.html';
    } else {
      alert('Error al registrar usuario');
    }
  } catch (error) {
    console.error('Error en el registro:', error);
    alert('Error en el servidor');
  }
});
