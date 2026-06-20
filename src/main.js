import { getLibros, getSolicitudes, saveSolicitud, updateSolicitud, isLibroPrestado } from './storage.js';
import { validateSolicitud, formatFecha } from './validation.js';

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById(`tab-${tab}`).classList.add('active');
    if (tab === 'catalogo') renderCatalogo();
    if (tab === 'panel') renderPanel();
  });
});

populateLibroSelect();

function populateLibroSelect() {
  const select = document.getElementById('libro');
  getLibros().forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.textContent = `${l.titulo} — ${l.autor}`;
    if (isLibroPrestado(l.id)) {
      opt.textContent += ' (no disponible)';
      opt.disabled = true;
    }
    select.appendChild(opt);
  });
}

const form = document.getElementById('form-solicitud');
const msgExito = document.getElementById('msg-exito');

function setError(field, msg) {
  document.getElementById(`error-${field}`).textContent = msg;
  document.getElementById(field).classList.toggle('invalid', !!msg);
}

function clearErrors() {
  ['solicitante', 'email', 'dni', 'libro', 'fecha-retiro'].forEach(f => setError(f, ''));
}

function validate(data) {
  clearErrors();
  const { valid, errors } = validateSolicitud(data);
  if (errors.solicitante) setError('solicitante', errors.solicitante);
  if (errors.email)       setError('email', errors.email);
  if (errors.dni)         setError('dni', errors.dni);
  if (errors.libro)       setError('libro', errors.libro);
  if (errors.fechaRetiro) setError('fecha-retiro', errors.fechaRetiro);
  return valid;
}

form.addEventListener('submit', e => {
  e.preventDefault();

  const data = {
    solicitante: document.getElementById('solicitante').value,
    email: document.getElementById('email').value,
    dni: document.getElementById('dni').value,
    libroId: Number(document.getElementById('libro').value),
    libroTitulo: document.getElementById('libro').selectedOptions[0]?.text,
    fechaRetiro: document.getElementById('fecha-retiro').value,
  };

  if (!validate(data)) return;

  if (isLibroPrestado(data.libroId)) {
    setError('libro', 'Este libro ya está prestado.');
    return;
  }

  saveSolicitud(data);
  form.reset();
  const SUCCESS_DISPLAY_MS = 4000;
  msgExito.classList.remove('hidden');
  setTimeout(() => msgExito.classList.add('hidden'), SUCCESS_DISPLAY_MS);
});

const BADGE = {
  pendiente: '<span class="badge badge-pendiente">Pendiente</span>',
  activo:    '<span class="badge badge-activo">Activo</span>',
  devuelto:  '<span class="badge badge-devuelto">Devuelto</span>',
  rechazado: '<span class="badge badge-rechazado">Rechazado</span>',
};

function renderCatalogo() {
  const container = document.getElementById('lista-catalogo');
  const libros = getLibros();

  container.innerHTML = libros.map(l => {
    const prestado = isLibroPrestado(l.id);
    return `
      <div class="card">
        <div class="card-header">
          <div>
            <h3>${l.titulo}</h3>
            <p>${l.autor} · ISBN: ${l.isbn}</p>
          </div>
          ${prestado
            ? '<span class="badge badge-prestado">Prestado</span>'
            : '<span class="badge badge-disponible">Disponible</span>'}
        </div>
      </div>`;
  }).join('');
}

function getPendientes(solicitudes)  { return solicitudes.filter(s => s.estado === 'pendiente') }
function getActivos(solicitudes)     { return solicitudes.filter(s => s.estado === 'activo') }
function getHistorial(solicitudes)   { return solicitudes.filter(s => ['devuelto', 'rechazado'].includes(s.estado)) }

function renderPanel() {
  const todas = getSolicitudes();

  renderGrupo('lista-pendientes', getPendientes(todas), [
    { label: 'Aprobar',  cls: 'btn-aprobar',  action: id => { updateSolicitud(id, { estado: 'activo' }); renderPanel(); } },
    { label: 'Rechazar', cls: 'btn-rechazar', action: id => { updateSolicitud(id, { estado: 'rechazado' }); renderPanel(); } },
  ]);

  renderGrupo('lista-activos', getActivos(todas), [
    { label: 'Registrar devolución', cls: 'btn-devolver', action: id => { updateSolicitud(id, { estado: 'devuelto', fechaDevolucion: new Date().toISOString().split('T')[0] }); renderPanel(); } },
  ]);

  renderGrupo('lista-historial', getHistorial(todas), []);
}

function renderGrupo(containerId, items, acciones) {
  const el = document.getElementById(containerId);

  if (items.length === 0) {
    el.innerHTML = '<p class="sin-items">Sin registros.</p>';
    return;
  }

  el.innerHTML = items.map(s => `
    <div class="card" data-id="${s.id}">
      <div class="card-header">
        <div>
          <h3>${s.libroTitulo}</h3>
          <p>${s.solicitante} · DNI ${s.dni} · ${s.email}</p>
          <p>Retiro: ${formatFecha(s.fechaRetiro)}${s.fechaDevolucion ? ' · Devuelto: ' + formatFecha(s.fechaDevolucion) : ''}</p>
        </div>
        ${BADGE[s.estado]}
      </div>
      ${acciones.length ? `<div class="card-actions">${acciones.map(a => `<button class="btn-sm ${a.cls}" data-action="${a.cls}">${a.label}</button>`).join('')}</div>` : ''}
    </div>
  `).join('');

  acciones.forEach(a => {
    el.querySelectorAll(`[data-action="${a.cls}"]`).forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.closest('.card').dataset.id);
        a.action(id);
      });
    });
  });
}
