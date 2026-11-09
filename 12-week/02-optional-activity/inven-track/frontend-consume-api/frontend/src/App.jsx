import { useCallback, useState } from 'react'
import Login from './components/Login.jsx'
import Productos from './components/Productos.jsx'

const CLAVE = 'inventrack.sesion'

// sessionStorage: la sesión se borra al cerrar la pestaña (menos expuesta que localStorage)
function leerSesion() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE))
  } catch {
    return null
  }
}

function guardarSesion(sesion) {
  try {
    if (sesion) sessionStorage.setItem(CLAVE, JSON.stringify(sesion))
    else sessionStorage.removeItem(CLAVE)
  } catch {
    // almacenamiento no disponible: la sesión solo vive en memoria
  }
}

export default function App() {
  const [sesion, setSesion] = useState(leerSesion)
  const [aviso, setAviso] = useState('')

  const entrar = (nueva) => {
    guardarSesion(nueva)
    setAviso('')
    setSesion(nueva)
  }

  const salir = useCallback(() => {
    guardarSesion(null)
    setSesion(null)
  }, [])

  const sesionExpirada = useCallback(() => {
    guardarSesion(null)
    setAviso('Tu sesión expiró. Inicia sesión de nuevo.')
    setSesion(null)
  }, [])

  if (!sesion) return <Login onLogin={entrar} aviso={aviso} />

  return (
    <Productos
      token={sesion.token}
      username={sesion.username}
      onLogout={salir}
      onSesionExpirada={sesionExpirada}
    />
  )
}
