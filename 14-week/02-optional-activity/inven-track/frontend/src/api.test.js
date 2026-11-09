import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, getProductos, ApiError } from './api.js'

function respuesta(status, cuerpo) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(cuerpo),
  })
}

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('login devuelve el token cuando las credenciales son correctas', async () => {
    fetch.mockReturnValue(respuesta(200, { token: 'abc', username: 'admin' }))

    const data = await login('admin', 'admin123')

    expect(data.token).toBe('abc')
    const [url, opciones] = fetch.mock.calls[0]
    expect(url).toContain('/api/auth/login')
    expect(opciones.method).toBe('POST')
  })

  it('getProductos envía el token en el encabezado Authorization', async () => {
    fetch.mockReturnValue(respuesta(200, []))

    await getProductos('mi-token')

    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer mi-token')
  })

  // Caso de error: el backend responde 401
  it('login lanza ApiError con el mensaje del servidor si responde 401', async () => {
    fetch.mockReturnValue(respuesta(401, { error: 'Usuario o contraseña incorrectos' }))

    await expect(login('admin', 'mala')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      message: 'Usuario o contraseña incorrectos',
    })
  })

  // Caso de error: no hay conexión (o CORS bloqueó la petición)
  it('lanza ApiError con status 0 si falla la red', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'))

    const promesa = getProductos('t')
    await expect(promesa).rejects.toBeInstanceOf(ApiError)
    await expect(promesa).rejects.toMatchObject({ status: 0 })
  })
})
