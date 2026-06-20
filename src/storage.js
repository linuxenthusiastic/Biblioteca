const KEYS = {
  solicitudes: 'biblioteca_solicitudes',
  libros: 'biblioteca_libros',
};

const LIBROS_INICIALES = [
  { id: 1, titulo: 'El principito', autor: 'Antoine de Saint-Exupéry', isbn: '978-950-731-000-1' },
  { id: 2, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', isbn: '978-950-731-000-2' },
  { id: 3, titulo: '1984', autor: 'George Orwell', isbn: '978-950-731-000-3' },
  { id: 4, titulo: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes', isbn: '978-950-731-000-4' },
  { id: 5, titulo: 'Rayuela', autor: 'Julio Cortázar', isbn: '978-950-731-000-5' },
];

export function getLibros() {
  const raw = localStorage.getItem(KEYS.libros);
  if (!raw) {
    localStorage.setItem(KEYS.libros, JSON.stringify(LIBROS_INICIALES));
    return LIBROS_INICIALES;
  }
  return JSON.parse(raw);
}

export function getSolicitudes() {
  return JSON.parse(localStorage.getItem(KEYS.solicitudes) || '[]');
}

export function saveSolicitud(s) {
  const list = getSolicitudes();
  list.push({ ...s, id: Date.now(), estado: 'pendiente' });
  localStorage.setItem(KEYS.solicitudes, JSON.stringify(list));
}

export function updateSolicitud(id, changes) {
  const list = getSolicitudes().map(s => s.id === id ? { ...s, ...changes } : s);
  localStorage.setItem(KEYS.solicitudes, JSON.stringify(list));
}

export function isLibroPrestado(libroId) {
  return getSolicitudes().some(s => s.libroId === libroId && s.estado === 'activo');
}
