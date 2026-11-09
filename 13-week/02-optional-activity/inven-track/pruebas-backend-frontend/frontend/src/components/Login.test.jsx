import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from './Login.jsx'
import { ApiError } from '../api.js'

// Se aísla el componente reemplazando la capa de red (api.js).
// Nota: para simular fallos se usa una función normal que rechaza (no vi.fn), porque
// esta versión de Vitest reporta como error de la prueba un vi.fn que devuelve un rechazo.
const api = vi.hoisted(() => ({ login: null }))
vi.mock('../api.js', async (importOriginal) => ({
  ...(await importOriginal()),
  login: (...args) => api.login(...args),
}))

async function llenar(usuario, clave) {
  if (usuario) await userEvent.type(screen.getByLabelText('Usuario'), usuario)
  if (clave) await userEvent.type(screen.getByLabelText('Contraseña'), clave)
}

describe('<Login />', () => {
  beforeEach(() => { api.login = vi.fn() })

  it('entrega el token al padre cuando el login es correcto', async () => {
    api.login = vi.fn().mockResolvedValue({ token: 'tok-123', username: 'admin' })
    const onLogin = vi.fn()
    render(<Login onLogin={onLogin} />)

    await llenar('admin', 'admin123')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(api.login).toHaveBeenCalledWith('admin', 'admin123')
    expect(onLogin).toHaveBeenCalledWith({ token: 'tok-123', username: 'admin' })
  })

  // Caso de error: el backend rechaza las credenciales
  it('muestra el mensaje de error y no llama a onLogin si el servidor responde 401', async () => {
    api.login = () => Promise.reject(new ApiError('Usuario o contraseña incorrectos', 401))
    const onLogin = vi.fn()
    render(<Login onLogin={onLogin} />)

    await llenar('admin', 'mala')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos')
    expect(onLogin).not.toHaveBeenCalled()
  })

  // Caso límite: formulario vacío o incompleto
  it.each([
    ['ambos campos vacíos', '', ''],
    ['falta la contraseña', 'admin', ''],
    ['falta el usuario', '', 'admin123'],
  ])('no llama al backend si %s', async (_caso, usuario, clave) => {
    render(<Login onLogin={vi.fn()} />)

    await llenar(usuario, clave)
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Ingresa usuario y contraseña')
    expect(api.login).not.toHaveBeenCalled()
  })

  it('deshabilita el botón mientras espera la respuesta', async () => {
    let resolver
    api.login = () => new Promise((resolve) => (resolver = resolve))
    render(<Login onLogin={vi.fn()} />)

    await llenar('admin', 'admin123')
    // sin await: la petición queda pendiente a propósito
    const click = userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('button', { name: 'Entrando…' })).toBeDisabled()

    resolver({ token: 't', username: 'admin' })
    await click
  })

  it('muestra el aviso recibido (por ejemplo, sesión expirada)', () => {
    render(<Login onLogin={vi.fn()} aviso="Tu sesión expiró. Inicia sesión de nuevo." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Tu sesión expiró')
  })
})
