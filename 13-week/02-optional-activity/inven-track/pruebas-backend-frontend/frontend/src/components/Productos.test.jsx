import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Productos from './Productos.jsx'
import { ApiError } from '../api.js'

// Se aísla el componente reemplazando la capa de red (api.js).
// Nota: para simular fallos se usa una función normal que rechaza (no vi.fn), porque
// esta versión de Vitest reporta como error de la prueba un vi.fn que devuelve un rechazo.
const api = vi.hoisted(() => ({ getProductos: null }))
vi.mock('../api.js', async (importOriginal) => ({
  ...(await importOriginal()),
  getProductos: (...args) => api.getProductos(...args),
}))

const exito = (datos) => (api.getProductos = vi.fn().mockResolvedValue(datos))
const fallo = (error) => (api.getProductos = () => Promise.reject(error))

const PRODUCTOS = [
  { id: 1, nombre: 'Jamón Pietrán', categoria: 'Jamones', unidadMedida: 'kg', precioVenta: 38500, stockMinimo: 10 },
  { id: 2, nombre: 'Mortadela', categoria: 'Embutidos', unidadMedida: 'kg', precioVenta: 16500, stockMinimo: 12 },
]

function montar(props = {}) {
  const onLogout = vi.fn()
  const onSesionExpirada = vi.fn()
  render(
    <Productos
      token="tok"
      username="admin"
      onLogout={onLogout}
      onSesionExpirada={onSesionExpirada}
      {...props}
    />,
  )
  return { onLogout, onSesionExpirada }
}

describe('<Productos />', () => {
  beforeEach(() => { api.getProductos = null })

  it('muestra "Cargando…" y luego la tabla con los datos', async () => {
    const llamada = exito(PRODUCTOS)
    montar()

    expect(screen.getByText('Cargando…')).toBeInTheDocument()
    expect(await screen.findByText('Jamón Pietrán')).toBeInTheDocument()
    expect(screen.getByText('Mortadela')).toBeInTheDocument()
    expect(screen.queryByText('Cargando…')).not.toBeInTheDocument()
    expect(llamada).toHaveBeenCalledWith('tok')
  })

  // Caso límite: la API responde bien pero sin datos
  it('muestra un mensaje cuando la lista está vacía', async () => {
    exito([])
    montar()

    expect(await screen.findByText('No hay productos registrados.')).toBeInTheDocument()
  })

  // Caso de error: fallo del servidor
  it('muestra el error y no la tabla si la API falla', async () => {
    fallo(new ApiError('Error 500', 500))
    const { onSesionExpirada } = montar()

    expect(await screen.findByRole('alert')).toHaveTextContent('Error 500')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(onSesionExpirada).not.toHaveBeenCalled()
  })

  // Caso de error: token vencido
  it('avisa que la sesión expiró cuando la API responde 401', async () => {
    fallo(new ApiError('No autenticado', 401))
    const { onSesionExpirada } = montar()

    await waitFor(() => expect(onSesionExpirada).toHaveBeenCalledTimes(1))
    // espera a que termine de actualizarse el estado de carga
    await waitFor(() => expect(screen.queryByText('Cargando…')).not.toBeInTheDocument())
  })

  it('el botón "Cerrar sesión" llama a onLogout', async () => {
    exito(PRODUCTOS)
    const { onLogout } = montar()

    await userEvent.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))
    expect(onLogout).toHaveBeenCalledTimes(1)
  })
})
