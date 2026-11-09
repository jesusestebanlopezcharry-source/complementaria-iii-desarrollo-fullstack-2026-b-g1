# Inven-Track — App fullstack segura y probada

API REST (Spring Boot, arquitectura en capas) para el inventario de una salsamentaria, con
autenticación **JWT**, un frontend en **React** que la consume, pruebas automatizadas y un
**Dockerfile** para correr todo en un contenedor.

Recurso principal: **Producto** (salsamentaria).

## Estructura

```
inven-track/
├── src/main/java/com/inventrack
│   ├── entity/      Producto (JPA + validaciones)
│   ├── repository/  ProductoRepository (Spring Data JPA)
│   ├── service/     ProductoService (lógica de negocio)
│   ├── controller/  ProductoController (endpoints REST)
│   ├── exception/   manejo global de errores (400, 401, 404, 409)
│   ├── auth/        Usuario, login (AuthController), DTOs
│   ├── security/    JwtService, JwtAuthFilter, SecurityConfig (JWT + CORS)
│   └── config/      DataInitializer (usuario y productos de ejemplo)
├── src/test/java/   pruebas del backend (JUnit 5 + MockMvc)
├── frontend/        React + Vite + Vitest (login y tabla de productos)
├── Dockerfile       build multi-etapa: frontend + backend -> una sola imagen
└── pom.xml
```

## Seguridad con JWT

1. El cliente envía sus credenciales a `POST /api/auth/login`.
2. Si son correctas, el servidor responde con un token JWT firmado (HS256) que vence a los 60 minutos.
3. Para cada petición a `/api/**` el cliente envía el encabezado `Authorization: Bearer <token>`.
4. Un filtro (`JwtAuthFilter`) valida la firma y la expiración. Sin token válido la API responde **401**.

| Ruta | Acceso |
|------|--------|
| `POST /api/auth/login` | Público |
| `/api/productos/**` | Requiere token |
| Frontend, Swagger (`/swagger-ui`), `/h2-console` | Públicos (solo desarrollo; ver nota) |

Las contraseñas se guardan con **BCrypt**. El mensaje de error del login es el mismo si falla
el usuario o la contraseña, para no revelar qué usuarios existen.

**Usuario de desarrollo** (se crea al arrancar): `admin` / `admin123`.

### Variables de entorno

| Variable | Descripción | Valor por defecto (solo desarrollo) |
|----------|-------------|-------------------------------------|
| `JWT_SECRET` | Secreto de firma, **mínimo 32 caracteres** | `dev-only-secret-change-me-please-0123456789` |
| `JWT_EXPIRATION_MINUTES` | Duración del token | `60` |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos, separados por coma | `http://localhost:5173` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Usuario inicial | `admin` / `admin123` |

> **Importante:** los valores por defecto son solo para desarrollo. En cualquier despliegue real
> define `JWT_SECRET` y `ADMIN_PASSWORD`, y deshabilita la consola H2
> (`spring.h2.console.enabled=false`).

## CORS

En desarrollo el frontend corre en `http://localhost:5173` y la API en `http://localhost:8080`:
son orígenes distintos, así que el navegador bloquea las llamadas salvo que el backend las autorice.
`SecurityConfig` define una política CORS que:

- Permite **solo** los orígenes de `CORS_ALLOWED_ORIGINS` (no usa `*`).
- Permite los métodos `GET, POST, PUT, DELETE, OPTIONS` y los encabezados `Authorization` y `Content-Type`.
- Deja pasar las peticiones *preflight* (`OPTIONS`) sin exigir token.

Dentro del contenedor Docker el frontend lo sirve el mismo Spring Boot, por lo que usa el
mismo origen y no necesita CORS.

## Ejecutar en desarrollo

Requisitos: Java 17, Maven y Node 20+.

```bash
# Terminal 1: backend  ->  http://localhost:8080
mvn spring-boot:run

# Terminal 2: frontend ->  http://localhost:5173
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173 e ingresa con `admin` / `admin123`.

Consola H2: http://localhost:8080/h2-console — JDBC URL `jdbc:h2:mem:inventrackdb`, usuario `sa`, sin contraseña.

## Pruebas

```bash
# Backend (JUnit 5 + MockMvc)
mvn test

# Frontend (Vitest + Testing Library)
cd frontend && npm test
```

**Backend** (`src/test/java`):

| Prueba | Qué verifica |
|--------|--------------|
| Login correcto | 200 y devuelve un token |
| Login con clave incorrecta / usuario inexistente | **401** |
| Login con campos vacíos | **400** |
| Listar sin token / con token manipulado | **401** |
| Listar y crear con token válido | 200 / 201 |
| Crear producto inválido con token | **400** |
| CORS con origen del frontend / origen desconocido | Permitido / **403** |

**Frontend** (`frontend/src`):

| Prueba | Qué verifica |
|--------|--------------|
| Login correcto | Muestra la tabla de productos y envía el token |
| Login con credenciales malas | Muestra el error y no entra |
| Campos vacíos | Valida sin llamar al backend |
| Token vencido (401 al pedir datos) | Vuelve al login con aviso |
| Fallo de red | `ApiError` con status 0 |

## Docker

El `Dockerfile` es multi-etapa: compila el frontend, compila el backend incluyendo el frontend
como contenido estático, y deja una imagen final liviana (JRE) que corre sin usuario root.

```bash
# Construir la imagen
docker build -t inven-track .

# Correr el contenedor
docker run --rm -p 8080:8080 \
  -e JWT_SECRET="cambia-este-secreto-por-uno-largo-y-aleatorio-123" \
  -e ADMIN_PASSWORD="una-clave-segura" \
  inven-track
```

Abre http://localhost:8080 (frontend + API en el mismo contenedor).

Probar la API desde la terminal:

```bash
# 1. Obtener el token
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"una-clave-segura"}'

# 2. Usarlo
curl http://localhost:8080/api/productos -H "Authorization: Bearer <TOKEN>"

# 3. Sin token -> 401
curl -i http://localhost:8080/api/productos
```

## Endpoints

Todos requieren `Authorization: Bearer <token>`, excepto el login.

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Inicia sesión y devuelve el token (público) |
| GET | /api/productos | Lista todos los productos |
| GET | /api/productos?categoria=Jamones | Filtra productos por categoría |
| GET | /api/productos/{id} | Obtiene un producto por ID |
| POST | /api/productos | Crea un producto (201 + Location) |
| PUT | /api/productos/{id} | Actualiza un producto |
| DELETE | /api/productos/{id} | Elimina un producto (204) |

## Ejemplos (cURL)

```bash
TOKEN="<pega aquí el token del login>"

# Listar
curl http://localhost:8080/api/productos -H "Authorization: Bearer $TOKEN"

# Filtrar por categoría
curl "http://localhost:8080/api/productos?categoria=Jamones" -H "Authorization: Bearer $TOKEN"

# Obtener por ID
curl http://localhost:8080/api/productos/1 -H "Authorization: Bearer $TOKEN"

# Crear
curl -X POST http://localhost:8080/api/productos \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"Jamón Pietrán 2","categoria":"Jamones","unidadMedida":"kg","precioVenta":38500,"stockMinimo":10}'

# Actualizar
curl -X PUT http://localhost:8080/api/productos/1 \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"Jamón Pietrán","categoria":"Jamones","unidadMedida":"kg","precioVenta":40000,"stockMinimo":10}'

# Eliminar
curl -X DELETE http://localhost:8080/api/productos/1 -H "Authorization: Bearer $TOKEN"
```

## Swagger / OpenAPI

- Swagger UI: http://localhost:8080/swagger-ui/index.html
- Documentación OpenAPI: http://localhost:8080/v3/api-docs

## Manejo de errores

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Producto creado correctamente |
| 204 | Producto eliminado correctamente |
| 400 | Datos que no cumplen las validaciones |
| 401 | Sin token, token inválido/vencido, o credenciales de login incorrectas |
| 404 | Producto no encontrado |
| 409 | Conflicto (ya existe un producto con ese nombre) |

Ejemplos:

- `GET /api/productos` sin token → **401**
- `POST /api/auth/login` con clave incorrecta → **401** `{"error":"Usuario o contraseña incorrectos"}`
- `POST /api/productos` con `"nombre": ""` → **400**
- `GET /api/productos/9999` → **404**

## Versionamiento

El proyecto usa Git y se entrega mediante un fork en GitHub. Flujo de trabajo:

```bash
git checkout -b feature/seguridad-jwt-frontend-docker
# ... cambios ...
git add .
git commit -m "feat: agrega seguridad JWT y CORS al backend"
git push -u origin feature/seguridad-jwt-frontend-docker
```

Convención de mensajes de commit: `feat:` (funcionalidad), `test:` (pruebas), `docs:` (documentación), `chore:` (configuración).
Historial: `git log --oneline`.

## Estado del proyecto

- API REST con arquitectura en capas y CRUD de Producto.
- Spring Data JPA con H2, validaciones y manejo global de errores (400, 401, 404, 409).
- Seguridad: login con JWT, endpoints protegidos, contraseñas con BCrypt, CORS restringido.
- Frontend React: login y vista de productos, con manejo de errores y sesión expirada.
- Pruebas: backend (JUnit 5 + MockMvc) y frontend (Vitest + Testing Library), con casos de error.
- Docker: imagen multi-etapa que sirve frontend y API juntos.
- Documentación Swagger / OpenAPI.
