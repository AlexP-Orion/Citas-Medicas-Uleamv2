document.addEventListener('DOMContentLoaded', () => {
  aplicarPreferenciasAccesibilidad();
  inicializarEventosAccesibilidad();
  inicializarLecturaAutomatica();
  inicializarAyudaContextual();
  mostrarIndicadorAtajos();
});

/* === Aplicar preferencias guardadas === */
function aplicarPreferenciasAccesibilidad() {
  const clases = {
    'grande': 'fuente',
    'modo-oscuro': 'oscuro',
    'alto-contraste': 'contraste',
    'modo-focus': 'focus',
    'fuente-legible': 'fuente-legible',
    'modo-monocromatico': 'monocromatico',
    'espaciado-amplio': 'espaciado',
    'enlace-resaltado': 'resaltado',
    'pausar-animaciones': 'animaciones',
  };

  for (const [clase, key] of Object.entries(clases)) {
    if (localStorage.getItem(key) === '1' || localStorage.getItem(key) === 'grande') {
      document.body.classList.add(clase);
      activarBoton(getBotonIdDesdeClase(clase));
    }
  }

  if (localStorage.getItem('lectura') === '1') activarLectura();
  if (localStorage.getItem('ayuda') === '1') activarAyuda();
    if (localStorage.getItem('monocromatico') === '1') {
    document.body.classList.add('modo-monocromatico');
    activarBoton('btnMonocromatico');
  }
  if (localStorage.getItem('espaciado') === '1') {
    document.body.classList.add('espaciado-amplio');
    activarBoton('btnEspaciado');
  }
  if (localStorage.getItem('resaltado') === '1') {
    document.body.classList.add('enlace-resaltado');
    activarBoton('btnResaltado');
  }
  if (localStorage.getItem('animaciones') === '1') {
    document.body.classList.add('pausar-animaciones');
    activarBoton('btnAnimaciones');
  }
  if (localStorage.getItem('lupa') === '1') {
    document.body.classList.add('lupa-activa');
    activarBoton('btnLupa');
    activarLupa();
  }

}

function getBotonIdDesdeClase(clase) {
  return {
    'grande': 'btnLetraGrande',
    'modo-oscuro': 'btnModoOscuro',
    'alto-contraste': 'btnContraste',
    'modo-focus': 'btnTeclado',
    'fuente-legible': 'btnFuenteClara',
    'modo-monocromatico': 'btnMonocromatico',
    'espaciado-amplio': 'btnEspaciado',
    'enlace-resaltado': 'btnResaltado',
    'pausar-animaciones': 'btnAnimaciones',
  }[clase];
}

/* === Botones de accesibilidad === */
function inicializarEventosAccesibilidad() {
  const toggle = (clase, key, btnId) => {
    const activo = document.body.classList.toggle(clase);
    localStorage.setItem(key, activo ? '1' : '0');
    alternarBoton(btnId, activo);
  };

  window.activarLetraGrande = () => toggle('grande', 'fuente', 'btnLetraGrande');
  window.activarModoOscuro = () => toggle('modo-oscuro', 'oscuro', 'btnModoOscuro');
  window.activarContraste = () => toggle('alto-contraste', 'contraste', 'btnContraste');
  window.activarEnfoqueVisible = () => toggle('modo-focus', 'focus', 'btnTeclado');
  window.activarFuenteLegible = () => toggle('fuente-legible', 'fuente-legible', 'btnFuenteClara');

  window.restablecerAccesibilidad = () => {
    document.body.classList.remove(
      'grande', 'modo-oscuro', 'alto-contraste', 'modo-focus', 'fuente-legible', 'lectura-activa', 'ayuda-activa','modo-monocromatico', 'espaciado-amplio', 'enlace-resaltado', 'pausar-animaciones'
    );
    localStorage.clear();
    document.querySelectorAll('#menuAccesibilidad button').forEach(btn => btn.classList.remove('menu-opcion-activa'));
    detenerLectura();
    desactivarAyuda();
  };

  document.getElementById('btnAccesibilidad')?.addEventListener('click', () => {
    document.getElementById('menuAccesibilidad')?.classList.toggle('hidden');
  });

  document.querySelectorAll('.icono-ayuda').forEach(icono => {
    icono.setAttribute('tabindex', '0');
    const texto = icono.getAttribute('data-ayuda');
    if (texto) {
      icono.setAttribute('aria-label', texto);
      icono.setAttribute('role', 'tooltip');
    }
  });
}

  window.activarMonocromatico = () => toggle('modo-monocromatico', 'monocromatico', 'btnMonocromatico');
  window.alternarEspaciado = () => toggle('espaciado-amplio', 'espaciado', 'btnEspaciado');
  window.activarResaltado = () => toggle('enlace-resaltado', 'resaltado', 'btnResaltado');
  window.toggleAnimaciones = () => toggle('pausar-animaciones', 'animaciones', 'btnAnimaciones');

  window.toggleLupa = () => {
    const lupaActiva = document.body.classList.toggle('lupa-activa');
    alternarBoton('btnLupa', lupaActiva);
    localStorage.setItem('lupa', lupaActiva ? '1' : '0');

    if (lupaActiva) activarLupa(); else desactivarLupa();
  };


function alternarBoton(id, activo) {
  const btn = document.getElementById(id);
  if (btn) {
    btn.classList.toggle('menu-opcion-activa', activo);
  }
}

function activarBoton(id) {
  document.getElementById(id)?.classList.add('menu-opcion-activa');
}

/* === Lectura automática === */
let lector = window.speechSynthesis;
let lecturaActiva = false;

function inicializarLecturaAutomatica() {
  if (localStorage.getItem('lectura') === '1') activarLectura();

  document.addEventListener('focusin', e => {
    if (!lecturaActiva || !lector) return;
    const el = e.target;
    let texto = el.getAttribute('aria-label') || el.placeholder || el.innerText || el.value;
    if (texto) {
      detenerLectura();
      lector.speak(new SpeechSynthesisUtterance(texto));
    }
  });
}

window.toggleLectura = function () {
  lecturaActiva = !lecturaActiva;
  localStorage.setItem('lectura', lecturaActiva ? '1' : '0');
  alternarBoton('btnLectura', lecturaActiva);
  if (!lecturaActiva) detenerLectura();
};

function activarLectura() {
  lecturaActiva = true;
  alternarBoton('btnLectura', true);
}

function detenerLectura() {
  if (lector.speaking) lector.cancel();
}

/* === Ayuda contextual === */
function inicializarAyudaContextual() {
  if (localStorage.getItem('ayuda') === '1') activarAyuda();
}

window.toggleConsejos = function () {
  const activa = document.body.classList.toggle('ayuda-activa');
  localStorage.setItem('ayuda', activa ? '1' : '0');
  alternarBoton('btnConsejos', activa);
};

function activarAyuda() {
  document.body.classList.add('ayuda-activa');
  alternarBoton('btnConsejos', true);
}

function desactivarAyuda() {
  document.body.classList.remove('ayuda-activa');
  alternarBoton('btnConsejos', false);
}

/* === Atajos de teclado === */
let teclasVisibles = false;

document.addEventListener('keydown', e => {
  if ((e.altKey && e.key.toLowerCase() === 'a') && !teclasVisibles) {
    document.body.classList.add('teclas-visibles');
    document.getElementById('msgAtajos')?.classList.remove('hidden');
    document.getElementById('msgSalir')?.classList.remove('hidden');
    teclasVisibles = true;
  } else if (teclasVisibles && /^[a-zA-Z]$/.test(e.key)) {
    const destino = document.querySelector(`[data-key="${e.key.toUpperCase()}"]`);
    if (destino) {
      destino.focus();
      if (destino.tagName === 'BUTTON') destino.click();
    }
  } else if (e.key === 'Escape' && teclasVisibles) {
    document.body.classList.remove('teclas-visibles');
    document.getElementById('msgAtajos')?.classList.add('hidden');
    document.getElementById('msgSalir')?.classList.add('hidden');
    teclasVisibles = false;
  }
});

function mostrarIndicadorAtajos() {
  if (!teclasVisibles) {
    setTimeout(() => {
      document.getElementById('msgAtajos')?.classList.remove('hidden');
      setTimeout(() => {
        document.getElementById('msgAtajos')?.classList.add('hidden');
      }, 5000);
    }, 1000);
  }
}

/* === Mensajes toast con voz === */
function mostrarMensajeToast(texto, tipo = 'exito') {
  const mensaje = document.getElementById('mensajeCita');
  if (!mensaje) return;

  mensaje.textContent = texto;
  mensaje.className = `mensaje-toast ${tipo}`;
  mensaje.classList.remove('hidden');

  if (window.lecturaActiva && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(texto);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  setTimeout(() => {
    mensaje.classList.add('hidden');
  }, 4000);
}


/* === Escape para cerrar modales === */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;

  const modalEditar = document.getElementById('modalEditar');
  const modalCitas = document.getElementById('modalCitas');

  if (modalEditar?.style.display === 'flex') {
    cerrarModalEditar();
    mostrarMensajeToast('Se ha cerrado la ventana de edición.', 'exito');
  } else if (modalCitas?.style.display === 'flex') {
    cerrarModal();
    mostrarMensajeToast('Se ha cerrado el panel de citas.', 'exito');
  }
});

// Funciones visuales avanzadas
window.toggleAnimaciones = function () {
  const activo = document.body.classList.toggle('pausar-animaciones');
  localStorage.setItem('animaciones', activo ? '1' : '0');
  alternarBoton('btnAnimaciones', activo);
};

window.alternarEspaciado = function () {
  const activo = document.body.classList.toggle('espaciado-amplio');
  localStorage.setItem('espaciado', activo ? '1' : '0');
  alternarBoton('btnEspaciado', activo);
};

window.activarResaltado = function () {
  const activo = document.body.classList.toggle('enlace-resaltado');
  localStorage.setItem('resaltado', activo ? '1' : '0');
  alternarBoton('btnResaltado', activo);
};

window.activarMonocromatico = function () {
  const activo = document.body.classList.toggle('modo-monocromatico');
  localStorage.setItem('monocromatico', activo ? '1' : '0');
  alternarBoton('btnMonocromatico', activo);
};
