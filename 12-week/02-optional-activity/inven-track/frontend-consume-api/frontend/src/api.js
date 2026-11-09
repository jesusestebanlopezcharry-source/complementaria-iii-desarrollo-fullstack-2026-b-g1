// URL base del backend. Vacía = mismo origen (cuando corre dentro del contenedor).
const API_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, options)
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0)
  }

  if (!res.ok) {
    let mensaje = `Error ${res.status}`
    try {
      const data = await res.json()
      if (data.error) mensaje = data.error
    } catch {
      // la respuesta no era JSON: se deja el mensaje genérico
    }
    throw new ApiError(mensaje, res.status)
  }
  return res.json()
}

export function login(username, password) {
  return request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
}

export function getProductos(token) {
  return request('/api/productos', {
    headers: { Authorization: `Bearer ${token}` },
  })
}
