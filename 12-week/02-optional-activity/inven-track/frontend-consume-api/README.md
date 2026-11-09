# Inven-Track — Punto 2: Frontend que consume la API con token

Frontend en **React + Vite** que hace login contra la API, guarda el token, consume un endpoint
protegido y muestra los datos, resolviendo **CORS** y manejando **carga** y **error**.

> Esta carpeta es autosuficiente: incluye el backend del punto 1 (JWT) con la configuración de CORS,
> y el frontend en `frontend/`.

## Qué hace el frontend

1. **Login** (`components/Login.jsx`): formulario usuario/contraseña → `POST /api/auth/login`.
2. **Guarda el token** (`App.jsx`) en `sessionStorage`: se borra al cerrar la pestaña y la sesión
   sobrevive a recargar la página. (Es menos expuesto que `localStorage`; ninguno es inmune a XSS,
   por eso la app no inyecta HTML y React escapa el contenido.)
3. **Consume un endpoint protegido** (`components/Productos.jsx`): `GET /api/productos` con el
   encabezado `Authorization: Bearer <token>` y muestra una tabla con los productos.
4. **Carga y error:**

| Situación | Comportamiento |
|-----------|----------------|
| Esperando la respuesta | "Cargando…" en la tabla / botón "Entrando…" en el login |
| Credenciales incorrectas (401) | Mensaje del servidor en el formulario |
| Campos vacíos | Se valida en el navegador, sin llamar a la API |
| Token vencido (401 en datos) | Se borra la sesión y vuelve al login con aviso |
| Servidor caído / CORS bloqueado | "No se pudo conectar con el servidor" |
| Lista vacía | "No hay productos registrados." |

El cliente HTTP está centralizado en `src/api.js` (`login`, `getProductos`, clase `ApiError`).

## CORS

En desarrollo el frontend corre en `http://localhost:5173` y la API en `http://localhost:8080`. Son
**orígenes distintos**, así que el navegador bloquea la llamada a menos que el backend la autorice.

Se resuelve en el backend (`security/SecurityConfig.java`):

- Se permiten **solo** los orígenes de `CORS_ALLOWED_ORIGINS` (por defecto `http://localhost:5173`). No se usa `*`.
- Métodos: `GET, POST, PUT, DELETE, OPTIONS`. Encabezados: `Authorization`, `Content-Type`.
- Las peticiones *preflight* (`OPTIONS`) se dejan pasar sin token, porque el navegador no envía
  credenciales en ellas. Si no, el preflight daría 401 y el navegador bloquearía todo.

La URL de la API del frontend sale de `frontend/.env.development` (`VITE_API_URL=http://localhost:8080`).

## Ejecutar

Requisitos: Java 17, Maven y Node 20+. Se necesitan **dos terminales**:

```bash
# Terminal 1 — backend  (http://localhost:8080)
mvn spring-boot:run

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173 e ingresa con **admin / admin123**.

### Cómo comprobar cada requisito

- **Login + token:** tras ingresar, en las herramientas del navegador → *Application → Session Storage*
  verás la clave `inventrack.sesion` con el token.
- **Token enviado:** *Network* → petición `productos` → *Request Headers* → `Authorization: Bearer …`.
- **CORS:** *Network* → verás una petición `OPTIONS` (preflight) con 200 y la respuesta con
  `Access-Control-Allow-Origin: http://localhost:5173`.
- **Error:** escribe una clave incorrecta (mensaje de error), o apaga el backend (mensaje de conexión).
- **Carga:** el texto "Cargando…" aparece mientras llega la respuesta.

### Variables de entorno del backend

| Variable | Descripción | Por defecto (solo desarrollo) |
|----------|-------------|-------------------------------|
| `JWT_SECRET` | Secreto de firma, mínimo 32 caracteres | `dev-only-secret-change-me-please-0123456789` |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos, separados por coma | `http://localhost:5173` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Usuario inicial | `admin` / `admin123` |

> En un despliegue real define `JWT_SECRET` y `ADMIN_PASSWORD`, y desactiva la consola H2.

## Estructura del frontend

```
frontend/
├── .env.development      VITE_API_URL
├── index.html
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx           sesión (token) y cambio entre Login / Productos
    ├── api.js            login(), getProductos(), ApiError
    ├── styles.css
    └── components/
        ├── Login.jsx
        └── Productos.jsx
```

## Versionamiento

```bash
git checkout -b feature/frontend-api
git add .
git commit -m "feat: agrega frontend React con login, token y vista de productos"
git push -u origin feature/frontend-api
```
