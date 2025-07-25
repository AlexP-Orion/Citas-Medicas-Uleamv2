document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const cedula = document.getElementById('cedula').value;
  const nombre = document.getElementById('nombre').value;
  const password = document.getElementById('password').value;

  const res = await fetch('http://localhost:3000/api/usuarios/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cedula, nombre, password })
  });

  const data = await res.json();

  if (data.success) {
    alert('Registro exitoso. Ahora inicia sesión.');
    window.location.href = 'login.html';
  } else {
    alert(data.message);
  }
});
