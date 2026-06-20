const KEYS = {
  solicitudes: 'biblioteca_solicitudes',
  libros:      'biblioteca_libros',
};

const ESTADO_INICIAL = 'pendiente';

let _idCounter = 0;
function _generateId() {
  return Date.now() + (++_idCounter);
}

const LIBROS_INICIALES = [
  { id: 1, titulo: 'El principito',           autor: 'Antoine de Saint-Exupéry', isbn: '978-950-731-000-1' },
  { id: 2, titulo: 'Cien años de soledad',    autor: 'Gabriel García Márquez',   isbn: '978-950-731-000-2' },
  { id: 3, titulo: '1984',                    autor: 'George Orwell',             isbn: '978-950-731-000-3' },
  { id: 4, titulo: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes',     isbn: '978-950-731-000-4' },
  { id: 5, titulo: 'Rayuela',                 autor: 'Julio Cortázar',            isbn: '978-950-731-000-5' },
];

function _initLibrosIfEmpty() {
  if (!localStorage.getItem(KEYS.libros)) {
    localStorage.setItem(KEYS.libros, JSON.stringify(LIBROS_INICIALES));
  }
}

export function getLibros() {
  _initLibrosIfEmpty();
  return JSON.parse(localStorage.getItem(KEYS.libros));
}

export function getSolicitudes() {
  return JSON.parse(localStorage.getItem(KEYS.solicitudes) || '[]');
}

export function saveSolicitud(solicitud) {
  const list = getSolicitudes();
  list.push({ ...solicitud, id: _generateId(), estado: ESTADO_INICIAL });
  localStorage.setItem(KEYS.solicitudes, JSON.stringify(list));
}

export function updateSolicitud(id, changes) {
  const list = getSolicitudes().map(s => s.id === id ? { ...s, ...changes } : s);
  localStorage.setItem(KEYS.solicitudes, JSON.stringify(list));
}

export function isLibroPrestado(libroId) {
  return getSolicitudes().some(s => s.libroId === libroId && s.estado === 'activo');
}

export function getSolicitudesByEstado(estado) {
  return getSolicitudes().filter(s => s.estado === estado);
}

export function cancelarSolicitud(id) {
  const solicitud = getSolicitudes().find(s => s.id === id);
  if (!solicitud || solicitud.estado !== ESTADO_INICIAL) {
    throw new Error('Solo se pueden cancelar solicitudes pendientes');
  }
  updateSolicitud(id, { estado: 'rechazado' });
}
