document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('formCita')) return;

  const cedula = localStorage.getItem('cedula');
  const nombre = localStorage.getItem('nombre');

  if (!cedula || !nombre) {
    window.location.href = 'login.html';
    return;
  }

  const selectEspecialidad = document.getElementById('especialidad');
  const selectMedico = document.getElementById('medico');
  const selectDia = document.getElementById('dia');
  const selectHora = document.getElementById('hora');
  const respuestaDiv = document.getElementById('respuesta');
  const hoy = new Date().toISOString().split('T')[0];
  selectDia.setAttribute('min', hoy);

  function generarHorasLaborales() {
    const horas = [];
    for (let h = 8; h < 17; h++) {
      horas.push(`${h.toString().padStart(2, '0')}:00:00`);
      horas.push(`${h.toString().padStart(2, '0')}:30:00`);
    }
    horas.push('17:00:00');
    return horas;
  }

  selectEspecialidad.addEventListener('change', () => {
    const especialidadId = selectEspecialidad.value;

    selectMedico.innerHTML = '<option value="">-- Seleccione un médico --</option>';
    selectDia.value = '';
    selectHora.innerHTML = '<option value="">-- Seleccione una hora --</option>';

    if (!especialidadId) return;

    fetch(`http://localhost:3000/api/medicos/${especialidadId}`)
      .then(res => res.json())
      .then(medicos => {
        medicos.forEach(m => {
          const option = document.createElement('option');
          option.value = m.id;
          option.textContent = m.nombre;
          selectMedico.appendChild(option);
        });
      });
  });

  selectMedico.addEventListener('change', () => {
    selectDia.value = '';
    selectHora.innerHTML = '<option value="">-- Seleccione una hora --</option>';
  });

  selectDia.addEventListener('change', () => {
    const fecha = selectDia.value;
    const medicoId = selectMedico.value;

    selectHora.innerHTML = '<option value="">-- Seleccione una hora --</option>';

    if (!fecha || !medicoId) return;

    fetch(`http://localhost:3000/api/citas/ocupadas/${medicoId}/${fecha}`)
      .then(res => res.json())
      .then(horasOcupadas => {
        const horasLaborales = generarHorasLaborales();
        let hayDisponibles = false;

        horasLaborales.forEach(hora => {
          const option = document.createElement('option');
          option.value = hora;
          option.textContent = hora.slice(0, 5);

          if (horasOcupadas.includes(hora)) {
            option.disabled = true;
            option.textContent += ' (Ocupado)';
          } else {
            hayDisponibles = true;
          }

          selectHora.appendChild(option);
        });

        respuestaDiv.textContent = hayDisponibles ? '' : 'No hay horarios disponibles para este día.';
      })
      .catch(err => {
        console.error('Error al cargar horas:', err);
        respuestaDiv.textContent = 'Error al cargar horarios.';
      });
  });

  document.getElementById('formCita').addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = {
      cedula,
      nombre,
      especialidad: selectEspecialidad.options[selectEspecialidad.selectedIndex].text,
      medico_id: selectMedico.value,
      dia: selectDia.value,
      hora: selectHora.value,
      motivo: document.getElementById('motivo').value
    };

    if (!datos.cedula || !datos.nombre || !datos.medico_id || !datos.dia || !datos.hora || !datos.motivo) {
      respuestaDiv.textContent = 'Todos los campos son obligatorios.';
      leerMensaje?.(respuestaDiv.textContent); // usa función de accesibilidad.js si está activa
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/citas/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      const data = await res.json();
      mostrarMensajeToast(data.message || data.error, data.message ? 'exito' : 'error');

      if (data.message) {
        e.target.reset();
        selectMedico.innerHTML = '<option value="">-- Seleccione un médico --</option>';
        selectDia.innerHTML = '<option value="">-- Seleccione un día --</option>';
        selectHora.innerHTML = '<option value="">-- Seleccione una hora --</option>';
      }

    } catch (error) {
      respuestaDiv.textContent = 'Error al conectar con el servidor.';
      leerMensaje?.('Error al conectar con el servidor.');
    }
  });

  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = 'login.html';
    });
  }
});
