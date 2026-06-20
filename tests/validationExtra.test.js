import { describe, test, expect } from 'vitest'
import { validateSolicitud, puedeTransicionar } from '../src/validation.js'

const MANANA = new Date(Date.now() + 86400000).toISOString().split('T')[0]

const solicitudBase = {
  solicitante: 'Juan Pérez',
  email: 'juan@correo.com',
  dni: '30456789',
  libroId: 1,
  fechaRetiro: MANANA,
}

describe('validateSolicitud - solicitante mínimo', () => {
  test('error si el solicitante tiene menos de 2 caracteres', () => {
    const { valid, errors } = validateSolicitud({ ...solicitudBase, solicitante: 'A' })
    expect(valid).toBe(false)
    expect(errors.solicitante).toBeTruthy()
  })

  test('acepta solicitante con exactamente 2 caracteres', () => {
    const { errors } = validateSolicitud({ ...solicitudBase, solicitante: 'Al' })
    expect(errors.solicitante).toBeUndefined()
  })
})

describe('puedeTransicionar - estado desconocido', () => {
  test('retorna false para un estado de origen desconocido', () => {
    expect(puedeTransicionar('borrado', 'activo')).toBe(false)
  })

  test('retorna false para un estado destino que no existe en las transiciones', () => {
    expect(puedeTransicionar('pendiente', 'borrado')).toBe(false)
  })
})
