const EMAIL_REGEX     = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DNI_REGEX       = /^\d{7,8}$/;
const SOLICITANTE_MIN = 2;

const TRANSICIONES = {
  pendiente: ['activo', 'rechazado'],
  activo:    ['devuelto'],
  devuelto:  [],
  rechazado: [],
};

function _validarSolicitante(solicitante, errors) {
  if (!solicitante || !solicitante.trim()) {
    errors.solicitante = 'El nombre es obligatorio.';
  } else if (solicitante.trim().length < SOLICITANTE_MIN) {
    errors.solicitante = 'El nombre debe tener al menos 2 caracteres.';
  }
}

export function validateSolicitud(data) {
  const errors = {};

  _validarSolicitante(data.solicitante, errors);

  if (!data.email || !data.email.trim()) {
    errors.email = 'El email es obligatorio.';
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = 'Formato de email inválido.';
  }

  if (!data.dni || !data.dni.trim()) {
    errors.dni = 'El DNI es obligatorio.';
  } else if (!DNI_REGEX.test(data.dni.trim())) {
    errors.dni = 'Ingresá un DNI válido (7 u 8 dígitos).';
  }

  if (!data.libroId) {
    errors.libro = 'Seleccioná un libro.';
  }

  if (!data.fechaRetiro) {
    errors.fechaRetiro = 'Seleccioná una fecha.';
  } else if (data.fechaRetiro < new Date().toISOString().split('T')[0]) {
    errors.fechaRetiro = 'La fecha no puede ser en el pasado.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function formatFecha(fecha) {
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

export function puedeTransicionar(estadoActual, nuevoEstado) {
  return (TRANSICIONES[estadoActual] || []).includes(nuevoEstado);
}
