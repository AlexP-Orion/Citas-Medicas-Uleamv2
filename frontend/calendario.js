let citaEnEdicion = null;

document.addEventListener('DOMContentLoaded', () => {
  const cedula = localStorage.getItem('cedula');
  const nombre = localStorage.getItem('nombre');

  if (!cedula || !nombre) {
    window.location.href = 'login.html';
    return;
  }

  const calendarEl = document.getElementById('calendar');
  let todasLasCitas = [];

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },

    events: async function (fetchInfo, successCallback, failureCallback) {
      try {
        const res = await fetch(`http://localhost:3000/api/citas/usuario/${cedula}`);
        todasLasCitas = await res.json();
        //console.log(todasLasCitas);

        const eventos = todasLasCitas.map(cita => ({
          title: '',
          start: cita.dia,
          allDay: true
        }));

        successCallback(eventos);
      } catch (error) {
        failureCallback(error);
      }
    },

    eventDidMount: function(info) {
      if (info.el && info.el.closest('.fc-daygrid-day')) {
        info.el.closest('.fc-daygrid-day').style.cursor = 'pointer';
      }
    },

    dateClick: function(info) {
      const fechaSeleccionada = info.dateStr;
      const citasDelDia = todasLasCitas.filter(c => {
        const fechaCita = new Date(c.dia).toISOString().slice(0, 10);
        return fechaCita === fechaSeleccionada;
      });

      if (citasDelDia.length > 0) {
        abrirModal(fechaSeleccionada, citasDelDia);
      }
    },

    eventClick: function(info) {
      const fechaSeleccionada = info.event.startStr.slice(0, 10);
      const citasDelDia = todasLasCitas.filter(c => {
        const fechaCita = new Date(c.dia).toISOString().slice(0, 10);
        return fechaCita === fechaSeleccionada;
      });

      if (citasDelDia.length > 0) {
        abrirModal(fechaSeleccionada, citasDelDia);
      }
    }
  });

  calendar.render();

  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = 'login.html';
    });
  }
});

function abrirModal(fecha, citas) {
  document.getElementById('modalFecha').textContent = fecha;
  const lista = document.getElementById('listaCitas');
  lista.innerHTML = '';

  citas.forEach(cita => {
    const hora = (cita.hora || '--:--').slice(0, 5);
    const especialidad = cita.especialidad || 'Especialidad';
    const medico = cita.medico || 'Doctor/a';

    const card = document.createElement('div');
    card.className = 'cita-card';
    card.innerHTML = `
      <div class="cita-info">
        <strong>${hora}</strong><br>
        <span>${especialidad}</span><br>
        <span>Con ${medico}</span>
      </div>
      <div class="cita-opciones">
        <button class="btn-editar" title="Editar cita" aria-label="Editar cita">✎ Editar</button>
        <button class="btn-eliminar" title="Eliminar cita" aria-label="Eliminar cita">🗑️ Eliminar</button>
      </div>
    `;
    document.getElementById('modalCitas').style.display = 'flex';
    document.querySelector('#modalCitas .cerrar-modal')?.focus();

    card.querySelector('.btn-editar').onclick = () => editarCita(cita);
    card.querySelector('.btn-eliminar').onclick = () => cancelarCita(cita);

    lista.appendChild(card);
  });

  document.getElementById('modalCitas').style.display = 'flex';
  atraparFoco(document.getElementById('modalCitas'));
}

function cerrarModal() {
  document.getElementById('modalCitas').style.display = 'none';
}

function editarCita(cita) {
  citaEnEdicion = cita;
  //console.log('Editando cita con ID:', cita.id);

  const fechaInput = document.getElementById('editarFecha');
  const horaSelect = document.getElementById('editarHora');

  fechaInput.value = cita.dia?.slice(0, 10);
  horaSelect.innerHTML = '<option value="">-- Seleccione una hora --</option>';

  fetch(`http://localhost:3000/api/medicos/disponibilidad/${cita.medico_id}`)
    .then(res => res.json())
    .then(disponibilidad => {
      const fecha = fechaInput.value;
      const ocupadas = disponibilidad[fecha] || [];

      for (let h = 8; h < 17; h++) {
        for (let m of [0, 30]) {
          const hora = `${h.toString().padStart(2, '0')}:${m === 0 ? '00' : '30'}`;
          const selected = cita.hora?.slice(0, 5) === hora;

          if (ocupadas.includes(hora) && !selected) continue;

          const option = document.createElement('option');
          option.value = hora;
          option.textContent = hora;
          if (selected) option.selected = true;
          horaSelect.appendChild(option);
        }
      }
    });

  document.getElementById('modalEditar').style.display = 'flex';
  document.getElementById('editarFecha')?.focus();
  atraparFoco(document.getElementById('modalEditar'));
}

function cerrarModalEditar() {
  document.getElementById('modalEditar').style.display = 'none';
  citaEnEdicion = null;
}

document.getElementById('formEditarCita').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fechaInput = document.getElementById('editarFecha');
  const horaInput = document.getElementById('editarHora');

  const nuevaFecha = fechaInput.value;
  const nuevaHora = horaInput.value;

  // Remover clases anteriores
  fechaInput.classList.remove('invalid');
  horaInput.classList.remove('invalid');

  // Validar
  let hayError = false;
  if (!nuevaFecha) {
    fechaInput.classList.add('invalid');
    hayError = true;
  }
  if (!nuevaHora) {
    horaInput.classList.add('invalid');
    hayError = true;
  }

  if (hayError) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/citas/${citaEnEdicion.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dia: nuevaFecha, hora: nuevaHora })
    });

    const data = await res.json();
    alert(data.message || 'Cita actualizada correctamente');
    cerrarModalEditar();
    location.reload();
  } catch (error) {
    alert('Error al conectar con el servidor');
  }
});

function cancelarCita(cita) {
  if (!confirm('¿Está seguro de que desea cancelar esta cita?')) return;

  fetch(`http://localhost:3000/api/citas/${cita.id}`, {
    method: 'DELETE'
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || 'Cita cancelada correctamente');
      location.reload();
    })
    .catch(err => {
      alert('Error al cancelar la cita');
    });
}

function atraparFoco(modal) {
  const focables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const elementos = Array.from(focables).filter(el => !el.disabled && el.offsetParent !== null);

  if (elementos.length === 0) return;

  const primero = elementos[0];
  const ultimo = elementos[elementos.length - 1];

  modal.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      const focables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const elementos = Array.from(focables).filter(el => !el.disabled && el.offsetParent !== null);
      const primero = elementos[0];
      const ultimo = elementos[elementos.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        }
      } else {
        if (document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    }

    if (e.key === 'Escape') {
      if (modal.id === 'modalCitas') {
        cerrarModal();
        mostrarMensajeToast('Se ha cerrado el panel de citas.', 'exito');
      } else if (modal.id === 'modalEditar') {
        cerrarModalEditar();
        mostrarMensajeToast('Se ha cerrado la ventana de edición.', 'exito');
      }
    }
  });


  // Foco inicial
  setTimeout(() => primero.focus(), 50);
}