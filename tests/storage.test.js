import { describe, test, expect, beforeEach, vi } from 'vitest'
import {
  getSolicitudes,
  saveSolicitud,
  updateSolicitud,
  isLibroPrestado,
  getSolicitudesByEstado,
  cancelarSolicitud,
} from '../src/storage.js'

const localStorageMock = (() => {
  let store = {}
  return {
    getItem:    (key) => store[key] ?? null,
    setItem:    (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear:      () => { store = {} },
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

beforeEach(() => {
  localStorageMock.clear()
})

describe('getSolicitudes', () => {
  test('retorna array vacío cuando no hay solicitudes', () => {
    expect(getSolicitudes()).toEqual([])
  })

  test('retorna las solicitudes guardadas', () => {
    saveSolicitud({ solicitante: 'Ana', libroId: 1, fechaRetiro: '2026-08-01' })
    expect(getSolicitudes()).toHaveLength(1)
    expect(getSolicitudes()[0].estado).toBe('pendiente')
  })
})

describe('updateSolicitud', () => {
  test('actualiza el estado de la solicitud', () => {
    saveSolicitud({ solicitante: 'Ana', libroId: 1, fechaRetiro: '2026-08-01' })
    const id = getSolicitudes()[0].id
    updateSolicitud(id, { estado: 'activo' })
    expect(getSolicitudes()[0].estado).toBe('activo')
  })
})

describe('isLibroPrestado', () => {
  test('retorna true si el libro tiene estado activo', () => {
    saveSolicitud({ solicitante: 'Ana', libroId: 2, fechaRetiro: '2026-08-01' })
    const id = getSolicitudes()[0].id
    updateSolicitud(id, { estado: 'activo' })
    expect(isLibroPrestado(2)).toBe(true)
  })

  test('retorna false si el libro no está prestado', () => {
    expect(isLibroPrestado(2)).toBe(false)
  })
})

describe('getSolicitudesByEstado', () => {
  test('retorna solo las solicitudes del estado indicado', () => {
    saveSolicitud({ solicitante: 'Ana',  libroId: 1, fechaRetiro: '2026-08-01' })
    saveSolicitud({ solicitante: 'Luis', libroId: 2, fechaRetiro: '2026-08-02' })
    const id = getSolicitudes()[0].id
    updateSolicitud(id, { estado: 'activo' })

    const pendientes = getSolicitudesByEstado('pendiente')
    expect(pendientes).toHaveLength(1)
    expect(pendientes[0].solicitante).toBe('Luis')
  })

  test('retorna array vacío si no hay solicitudes en ese estado', () => {
    expect(getSolicitudesByEstado('activo')).toEqual([])
  })
})

describe('cancelarSolicitud', () => {
  test('cambia el estado de pendiente a rechazado', () => {
    saveSolicitud({ solicitante: 'Ana', libroId: 1, fechaRetiro: '2026-08-01' })
    const id = getSolicitudes()[0].id
    cancelarSolicitud(id)
    expect(getSolicitudes()[0].estado).toBe('rechazado')
  })

  test('lanza error si la solicitud no está en estado pendiente', () => {
    saveSolicitud({ solicitante: 'Ana', libroId: 1, fechaRetiro: '2026-08-01' })
    const id = getSolicitudes()[0].id
    updateSolicitud(id, { estado: 'activo' })
    expect(() => cancelarSolicitud(id)).toThrow('Solo se pueden cancelar solicitudes pendientes')
  })
})
