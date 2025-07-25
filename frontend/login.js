document.getElementById('loginForm').addEventListener('submit', async (e) => {
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
