# Inven-Track — Punto 3: Pruebas de backend y frontend

Pruebas automatizadas para la API (Spring Boot) y para los componentes del frontend (React),
incluyendo **casos de error y casos límite**, no solo el camino feliz.

> Esta carpeta es autosuficiente: incluye el backend con JWT y CORS (puntos 1 y 2), el frontend,
> y las pruebas en `src/test/java` y `frontend/src`.

## Cómo ejecutar

```bash
# Backend  (requiere Java 17 y Maven)
mvn test

# Frontend (requiere Node 20+)
cd frontend
npm install
npm test
```

## Pruebas del backend (JUnit 5 + Mockito + MockMvc) — 17 pruebas

### Unitarias del service — `ProductoServiceTest`
Sin Spring ni base de datos: el repositorio es un mock de Mockito.

| Prueba | Tipo |
|--------|------|
| `obtenerPorId` con id existente devuelve el producto | Camino feliz |
| `obtenerPorId` con id inexistente lanza `RecursoNoEncontradoException` | **Error** |
| `crear` guarda e ignora un `id` enviado por el cliente | Camino feliz |
| `crear` con nombre duplicado lanza `RecursoDuplicadoException` y **no guarda** | **Error** |
| `listar` con categoría en blanco devuelve todos (no filtra) | **Límite** |
| `listar` con categoría filtra por categoría | Camino feliz |

### De endpoint (integración) — `AuthControllerTest` y `ProductoSeguridadTest`
Levantan la aplicación completa con `@SpringBootTest` y llaman a la API con `MockMvc`.

| Prueba | Resultado esperado | Tipo |
|--------|--------------------|------|
| Login con credenciales correctas | 200 y token | Camino feliz |
| Login con clave incorrecta | **401** | **Error** |
| Login con usuario inexistente | **401** | **Error** |
| Login con campos vacíos | **400** | **Límite** |
| Listar productos sin token | **401** | **Error** |
| Listar con token manipulado | **401** | **Error** |
| Listar con token válido | 200 y lista no vacía | Camino feliz |
| Crear producto con token | 201 | Camino feliz |
| Crear producto inválido con token | **400** | **Error** |
| CORS: preflight desde `http://localhost:5173` | 200 con `Access-Control-Allow-Origin` | Camino feliz |
| CORS: preflight desde un origen no autorizado | **403** | **Error** |

## Pruebas del frontend (Vitest + Testing Library) — 22 pruebas

Las pruebas de **componente** renderizan el componente y simulan lo que hace una persona
(escribir, hacer clic), aislándolo de la red con un mock de `api.js`.

### `Login.test.jsx` — componente `<Login />`

| Prueba | Tipo |
|--------|------|
| Login correcto: entrega el token al padre (`onLogin`) | Camino feliz |
| El servidor responde 401: muestra el mensaje y **no** llama a `onLogin` | **Error** |
| Campos vacíos / falta usuario / falta contraseña: no llama al backend (3 casos) | **Límite** |
| Mientras espera respuesta, el botón queda deshabilitado ("Entrando…") | Estado de carga |
| Muestra el aviso recibido (sesión expirada) | Camino feliz |

### `Productos.test.jsx` — componente `<Productos />`

| Prueba | Tipo |
|--------|------|
| Muestra "Cargando…" y luego la tabla con los datos | Camino feliz / carga |
| Lista vacía: muestra "No hay productos registrados." | **Límite** |
| La API falla (500): muestra el error y no la tabla | **Error** |
| La API responde 401: avisa que la sesión expiró | **Error** |
| "Cerrar sesión" llama a `onLogout` | Camino feliz |

### `App.test.jsx` — flujo completo (integración de componentes)
Login correcto → tabla con token enviado; credenciales malas; campos vacíos; token vencido; cerrar sesión.

### `api.test.js` — cliente HTTP
Token en `Authorization`; error 401 con mensaje del servidor; **fallo de red** (`status 0`).

## Verificación realizada

Las 22 pruebas del frontend se ejecutaron y pasan. Además se comprobó que las pruebas de error
**realmente detectan fallos**: al romper a propósito el código (el login ignorando el error del servidor,
o el componente de productos sin avisar la sesión expirada) fallaron exactamente las pruebas
correspondientes.

## Estructura

```
src/test/java/com/inventrack/
├── ProductoServiceTest.java       unitarias del service (Mockito)
├── AuthControllerTest.java        login (200 / 401 / 400)
└── ProductoSeguridadTest.java     JWT, validación y CORS
frontend/src/
├── api.test.js
├── App.test.jsx
├── setupTests.js
└── components/
    ├── Login.test.jsx
    └── Productos.test.jsx
```

## Ejecutar la aplicación

```bash
mvn spring-boot:run          # backend  -> http://localhost:8080
cd frontend && npm run dev   # frontend -> http://localhost:5173
```

Usuario de desarrollo: `admin` / `admin123`. Las variables de entorno (`JWT_SECRET`, `CORS_ALLOWED_ORIGINS`,
`ADMIN_PASSWORD`) están descritas en los README de las carpetas 1 y 2.

## Versionamiento

```bash
git checkout -b feature/pruebas
git add .
git commit -m "test: agrega pruebas de service, endpoints y componentes con casos de error"
git push -u origin feature/pruebas
```
