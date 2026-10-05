# Inven-Track - API REST (Spring Boot, arquitectura en capas)

Recurso implementado: **Producto** (salsamentaria).

## Estructura

com.inventrack

├── entity       -> Producto (JPA + validaciones)
├── repository   -> ProductoRepository (Spring Data JPA)
├── service      -> ProductoService (lógica de negocio)
├── controller   -> ProductoController (endpoints REST)
└── exception    -> manejo global de errores (404, 409, 400)

## Ejecutar

mvn spring-boot:run

API: http://localhost:8080/api/productos

Consola H2: http://localhost:8080/h2-console

JDBC URL: jdbc:h2:mem:inventrackdb

Usuario: sa

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/productos | Lista todos los productos |
| GET | /api/productos?categoria=Jamones | Filtra productos por categoría |
| GET | /api/productos/{id} | Obtiene un producto por ID |
| POST | /api/productos | Crea un producto (201 + Location) |
| PUT | /api/productos/{id} | Actualiza un producto |
| DELETE | /api/productos/{id} | Elimina un producto (204) |

## API reference

The GET /api/productos endpoint returns a list of all registered products.

The GET /api/productos?categoria=Jamones endpoint filters products by category.

The GET /api/productos/{id} endpoint returns a specific product using its ID.

The POST /api/productos endpoint creates a new product and returns a 201 Created response.

The PUT /api/productos/{id} endpoint updates the information of an existing product.

The DELETE /api/productos/{id} endpoint deletes a product and returns a 204 No Content response.

## Ejemplos

### GET - Listar productos

curl http://localhost:8080/api/productos

Respuesta esperada: 200 OK

### GET - Filtrar por categoría

curl "http://localhost:8080/api/productos?categoria=Jamones"

Respuesta esperada: 200 OK

### GET - Obtener producto por ID

curl http://localhost:8080/api/productos/1

Respuesta esperada: 200 OK

### POST - Crear producto

curl -X POST http://localhost:8080/api/productos \
-H "Content-Type: application/json" \
-d '{"nombre":"Jamón Pietrán","categoria":"Jamones","unidadMedida":"kg","precioVenta":38500,"stockMinimo":10}'

Respuesta esperada: 201 Created

### PUT - Actualizar producto

curl -X PUT http://localhost:8080/api/productos/1 \
-H "Content-Type: application/json" \
-d '{"nombre":"Jamón Pietrán","categoria":"Jamones","unidadMedida":"kg","precioVenta":40000,"stockMinimo":10}'

Respuesta esperada: 200 OK

### DELETE - Eliminar producto

curl -X DELETE http://localhost:8080/api/productos/1

Respuesta esperada: 204 No Content

## Swagger / OpenAPI

Swagger UI:

http://localhost:8080/swagger-ui/index.html

Documentación OpenAPI:

http://localhost:8080/v3/api-docs

## Manejo de errores

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Producto creado correctamente |
| 204 | Producto eliminado correctamente |
| 400 | Solicitud inválida o datos que no cumplen las validaciones |
| 404 | Producto no encontrado |
| 409 | Conflicto |

### Ejemplo de error 400

POST /api/productos

Body:

{
  "nombre": "",
  "categoria": "Jamones",
  "unidadMedida": "kg",
  "precioVenta": 38500,
  "stockMinimo": 10
}

Respuesta esperada: 400 Bad Request

### Ejemplo de error 404

GET /api/productos/9999

Respuesta esperada: 404 Not Found

### Ejemplo de error 409

Se presenta cuando existe un conflicto con la información del producto, de acuerdo con las reglas de negocio implementadas.

Respuesta esperada: 409 Conflict

## Pruebas de la API

Los endpoints pueden ser probados utilizando:

- Swagger UI
- Postman
- cURL

Operaciones a probar:

- GET /api/productos
- GET /api/productos?categoria=Jamones
- GET /api/productos/{id}
- POST /api/productos
- PUT /api/productos/{id}
- DELETE /api/productos/{id}

Casos de error:

- 400 Bad Request
- 404 Not Found
- 409 Conflict

## Versionamiento

El proyecto utiliza Git para el control de versiones.

Verificar los cambios:

git status

Agregar el README:

git add README.md

Crear el commit:

git commit -m "docs: actualiza README con ejecucion y endpoints"

Consultar el historial:

git log --oneline

## Estado del proyecto

- API REST implementada.
- Arquitectura en capas.
- Recurso Producto implementado.
- Operaciones CRUD implementadas.
- Spring Data JPA.
- Base de datos H2.
- Validaciones.
- Manejo global de errores.
- Documentación Swagger / OpenAPI.
- Endpoints documentados en el README.
- Ejemplos de uso mediante cURL.
- Manejo de errores 400, 404 y 409.
- Control de versiones mediante Git.