# Inven-Track — Login con JWT y endpoints protegidos

API REST (Spring Boot 3, Java 17) del inventario de una salsamentaria. En este punto se agrega:

- `POST /api/auth/login`, que devuelve un **JWT**.
- Protección de `/api/productos/**`: exigen `Authorization: Bearer <token>`.
- Flujo comprobable: **sin token → 401**, **con token → 200**.

## Cómo funciona

1. El cliente envía usuario y contraseña a `POST /api/auth/login`.
2. Si son correctos, el servidor responde con un token JWT firmado (HS256) que vence a los 60 minutos.
3. Para cada petición a `/api/**` el cliente envía `Authorization: Bearer <token>`.
4. `JwtAuthFilter` valida firma y expiración. Sin token válido, Spring Security responde **401** en JSON.

| Ruta | Acceso |
|------|--------|
| `POST /api/auth/login` | Público |
| `/api/productos/**` | Requiere token |
| Swagger y `/h2-console` | Públicos (solo desarrollo) |

Las contraseñas se guardan con BCrypt. El login devuelve el mismo mensaje si falla el usuario o la
contraseña, para no revelar qué usuarios existen.

## Archivos nuevos / modificados

```
pom.xml                       + spring-boot-starter-security, jjwt (api/impl/jackson)
application.properties        + app.jwt.secret, app.jwt.expiration-minutes, usuario inicial
auth/        Usuario, UsuarioRepository, LoginRequest, LoginResponse, AuthController (login)
security/    JwtService (genera/valida), JwtAuthFilter (lee el Bearer), SecurityConfig (reglas)
config/      DataInitializer (crea el usuario admin y productos de ejemplo)
exception/   + CredencialesInvalidasException -> 401 en GlobalExceptionHandler
probar-flujo.sh               script que verifica 401 / 200
```

## Ejecutar

Requisitos: Java 17 y Maven.

```bash
mvn spring-boot:run
```

API en http://localhost:8080. Usuario de desarrollo: **admin / admin123**.

### Variables de entorno

| Variable | Descripción | Por defecto (solo desarrollo) |
|----------|-------------|-------------------------------|
| `JWT_SECRET` | Secreto de firma, **mínimo 32 caracteres** | `dev-only-secret-change-me-please-0123456789` |
| `JWT_EXPIRATION_MINUTES` | Duración del token | `60` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Usuario inicial | `admin` / `admin123` |

> En un despliegue real define `JWT_SECRET` y `ADMIN_PASSWORD`, y desactiva la consola H2.

## Probar el flujo (sin token → 401, con token → 200)

Automático, con la API en marcha:

```bash
./probar-flujo.sh
```

Resultado esperado:

```
1) Sin token   -> HTTP 401
2) Login       -> HTTP 200 + token
3) Con token   -> HTTP 200
4) Token falso -> HTTP 401
```

Manual con cURL:

```bash
# 1. Sin token -> 401
curl -i http://localhost:8080/api/productos

# 2. Login -> devuelve el token
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 3. Con token -> 200
curl http://localhost:8080/api/productos -H "Authorization: Bearer <TOKEN>"
```

También puede probarse con Postman: haz el login, copia el `token` y agrégalo en
*Authorization → Bearer Token*.

## Códigos de respuesta

| Código | Cuándo |
|--------|--------|
| 200 | Login correcto / petición con token válido |
| 400 | Datos inválidos (por ejemplo, login con campos vacíos) |
| 401 | Sin token, token inválido o vencido, o credenciales incorrectas |
| 404 | Producto no encontrado |
| 409 | Ya existe un producto con ese nombre |

## Versionamiento

```bash
git checkout -b feature/login-jwt
git add .
git commit -m "feat: agrega login con JWT y protege endpoints de la API"
git push -u origin feature/login-jwt
```
