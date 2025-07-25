/*document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const cedula = document.getElementById('cedula').value;
  const password = document.getElementById('password').value;

  const res = await fetch('https://citas-backend-5e65.onrender.com/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cedula, password })
  });

  const data = await res.json();

  if (data.success) {
    localStorage.setItem('cedula', cedula);
    localStorage.setItem('nombre', data.nombre);
    window.location.href = 'index.html';
  } else {
    alert(data.message);
  }
});
*/
document.getElementById('formLogin').addEventListener('submit', async function (e) {
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
      // Redirigir si el inicio es exitoso
      window.location.href = 'calendario.html';
    } else {
      alert('Credenciales incorrectas');
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    alert('Error en el servidor');
  }
});
