import { describe, test, expect } from 'vitest'
import { validateSolicitud, puedeTransicionar } from '../src/validation.js'

const MANANA = new Date(Date.now() + 86400000).toISOString().split('T')[0]

const solicitudValida = {
  solicitante: 'Juan Pérez',
  email: 'juan@correo.com',
  dni: '30456789',
  libroId: 1,
  fechaRetiro: MANANA,
}

describe('validateSolicitud', () => {
  describe('caso válido', () => {
    test('retorna valid=true con todos los campos correctos', () => {
      const { valid, errors } = validateSolicitud(solicitudValida)
      expect(valid).toBe(true)
      expect(errors).toEqual({})
    })
  })

  describe('solicitante', () => {
    test('error si está vacío', () => {
      const { errors } = validateSolicitud({ ...solicitudValida, solicitante: '' })
      expect(errors.solicitante).toBeTruthy()
    })

    test('error si es solo espacios', () => {
      const { errors } = validateSolicitud({ ...solicitudValida, solicitante: '   ' })
      expect(errors.solicitante).toBeTruthy()
    })
  })

  describe('email', () => {
    test('error si está vacío', () => {
      const { errors } = validateSolicitud({ ...solicitudValida, email: '' })
      expect(errors.email).toBeTruthy()
    })

    test.each([
      'sinArroba',
      'sin@dominio',
      '@sinusuario.com',
    ])('error con email inválido: "%s"', (email) => {
      const { errors } = validateSolicitud({ ...solicitudValida, email })
      expect(errors.email).toBeTruthy()
    })

    test.each([
      'usuario@dominio.com',
      'nombre.apellido@empresa.com.ar',
    ])('acepta email válido: "%s"', (email) => {
      const { errors } = validateSolicitud({ ...solicitudValida, email })
      expect(errors.email).toBeUndefined()
    })
  })

  describe('dni', () => {
    test('error si está vacío', () => {
      const { errors } = validateSolicitud({ ...solicitudValida, dni: '' })
      expect(errors.dni).toBeTruthy()
    })

    test.each(['123456', '123456789', 'ABCDEFGH', '1234 56'])(
      'error con DNI inválido: "%s"',
      (dni) => {
        const { errors } = validateSolicitud({ ...solicitudValida, dni })
        expect(errors.dni).toBeTruthy()
      }
    )

    test.each(['1234567', '12345678'])(
      'acepta DNI válido: "%s"',
      (dni) => {
        const { errors } = validateSolicitud({ ...solicitudValida, dni })
        expect(errors.dni).toBeUndefined()
      }
    )
  })

  describe('libroId', () => {
    test('error si no se seleccionó libro', () => {
      const { errors } = validateSolicitud({ ...solicitudValida, libroId: 0 })
      expect(errors.libro).toBeTruthy()
    })

    test('acepta libroId válido', () => {
      const { errors } = validateSolicitud({ ...solicitudValida, libroId: 3 })
      expect(errors.libro).toBeUndefined()
    })
  })

  describe('fechaRetiro', () => {
    test('error si está vacía', () => {
      const { errors } = validateSolicitud({ ...solicitudValida, fechaRetiro: '' })
      expect(errors.fechaRetiro).toBeTruthy()
    })

    test('error si es en el pasado', () => {
      const { errors } = validateSolicitud({ ...solicitudValida, fechaRetiro: '2020-01-01' })
      expect(errors.fechaRetiro).toBeTruthy()
    })

    test('acepta fecha futura', () => {
      const { errors } = validateSolicitud({ ...solicitudValida, fechaRetiro: MANANA })
      expect(errors.fechaRetiro).toBeUndefined()
    })
  })

  describe('múltiples errores', () => {
    test('reporta todos los campos inválidos a la vez', () => {
      const { valid, errors } = validateSolicitud({ solicitante: '', email: '', dni: '', libroId: 0, fechaRetiro: '' })
      expect(valid).toBe(false)
      expect(Object.keys(errors)).toHaveLength(5)
    })
  })
})

describe('puedeTransicionar', () => {
  test.each([
    ['pendiente', 'activo',    true],
    ['pendiente', 'rechazado', true],
    ['activo',    'devuelto',  true],
    ['pendiente', 'devuelto',  false],
    ['activo',    'pendiente', false],
    ['devuelto',  'activo',    false],
    ['rechazado', 'activo',    false],
    ['devuelto',  'rechazado', false],
  ])('%s → %s = %s', (desde, hacia, esperado) => {
    expect(puedeTransicionar(desde, hacia)).toBe(esperado)
  })
})
