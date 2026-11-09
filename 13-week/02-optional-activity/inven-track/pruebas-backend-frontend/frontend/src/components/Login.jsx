import { useState } from 'react'
import { login } from '../api.js'

export default function Login({ onLogin, aviso }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(aviso ?? '')
  const [cargando, setCargando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('Ingresa usuario y contraseña')
      return
    }
    setCargando(true)
    setError('')
    try {
      const data = await login(username.trim(), password)
      onLogin({ token: data.token, username: data.username })
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="card">
      <h1>Inven-Track</h1>
      <p className="sub">Inicia sesión para ver el inventario</p>
      <form onSubmit={enviar}>
        <label htmlFor="usuario">Usuario</label>
        <input
          id="usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <label htmlFor="clave">Contraseña</label>
        <input
          id="clave"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button type="submit" disabled={cargando}>
          {cargando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
