import { useEffect, useState } from 'react'
import { getProductos } from '../api.js'

const formatoPrecio = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export default function Productos({ token, username, onLogout, onSesionExpirada }) {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    getProductos(token)
      .then((data) => activo && setProductos(data))
      .catch((err) => {
        if (!activo) return
        if (err.status === 401) onSesionExpirada()
        else setError(err.message)
      })
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [token, onSesionExpirada])

  return (
    <main className="card ancho">
      <header className="barra">
        <h1>Productos</h1>
        <div>
          <span className="usuario">{username}</span>
          <button onClick={onLogout}>Cerrar sesión</button>
        </div>
      </header>

      {cargando && <p>Cargando…</p>}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      {!cargando && !error && (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Unidad</th>
              <th>Precio</th>
              <th>Stock mín.</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>{p.unidadMedida}</td>
                <td>{formatoPrecio.format(p.precioVenta)}</td>
                <td>{p.stockMinimo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!cargando && !error && productos.length === 0 && <p>No hay productos registrados.</p>}
    </main>
  )
}
