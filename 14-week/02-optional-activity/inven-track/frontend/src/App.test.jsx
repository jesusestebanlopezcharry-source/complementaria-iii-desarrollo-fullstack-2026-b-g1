import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

function respuesta(status, cuerpo) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(cuerpo),
  })
}

const PRODUCTOS = [
  { id: 1, nombre: 'Jamón Pietrán', categoria: 'Jamones', unidadMedida: 'kg', precioVenta: 38500, stockMinimo: 10 },
  { id: 2, nombre: 'Queso doble crema', categoria: 'Quesos', unidadMedida: 'kg', precioVenta: 29000, stockMinimo: 8 },
]

async function iniciarSesion(user, clave) {
  await userEvent.type(screen.getByLabelText('Usuario'), user)
  await userEvent.type(screen.getByLabelText('Contraseña'), clave)
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('muestra el formulario de login al inicio', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('tras un login correcto muestra la tabla de productos', async () => {
    fetch
      .mockReturnValueOnce(respuesta(200, { token: 'tok', username: 'admin' }))
      .mockReturnValueOnce(respuesta(200, PRODUCTOS))

    render(<App />)
    await iniciarSesion('admin', 'admin123')

    expect(await screen.findByText('Jamón Pietrán')).toBeInTheDocument()
    expect(screen.getByText('Queso doble crema')).toBeInTheDocument()
    // la petición de productos lleva el token
    expect(fetch.mock.calls[1][1].headers.Authorization).toBe('Bearer tok')
  })

  // Caso de error: credenciales incorrectas
  it('muestra el error del servidor si el login falla y no entra a la vista de datos', async () => {
    fetch.mockReturnValueOnce(respuesta(401, { error: 'Usuario o contraseña incorrectos' }))

    render(<App />)
    await iniciarSesion('admin', 'mala')

    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos')
    expect(screen.queryByText('Productos')).not.toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  // Caso de error: campos vacíos (ni siquiera llama al backend)
  it('valida campos vacíos sin llamar al backend', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Ingresa usuario y contraseña')
    expect(fetch).not.toHaveBeenCalled()
  })

  // Caso de error: el token expiró mientras se veían los datos
  it('vuelve al login con aviso si la API responde 401 al pedir productos', async () => {
    fetch
      .mockReturnValueOnce(respuesta(200, { token: 'vencido', username: 'admin' }))
      .mockReturnValueOnce(respuesta(401, { error: 'No autenticado' }))

    render(<App />)
    await iniciarSesion('admin', 'admin123')

    expect(await screen.findByRole('alert')).toHaveTextContent('Tu sesión expiró')
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('cerrar sesión regresa al login', async () => {
    fetch
      .mockReturnValueOnce(respuesta(200, { token: 'tok', username: 'admin' }))
      .mockReturnValueOnce(respuesta(200, PRODUCTOS))

    render(<App />)
    await iniciarSesion('admin', 'admin123')
    await userEvent.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })
})
