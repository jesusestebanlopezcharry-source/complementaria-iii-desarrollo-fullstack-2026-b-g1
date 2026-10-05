# Actividad 8 — CRUD REST

Para esta actividad se reutilizaron la entidad `Producto` y el
`ProductoRepository` desarrollados en la Actividad 7.

Se implementaron las siguientes capas adicionales:

- `ProductoService.java`
- `ProductoController.java`

Además, se implementaron y probaron las operaciones CRUD:

- Crear producto — POST - /api/productos
- Listar productos — GET - /api/productos
- Obtener producto por ID — GET  -/api/productos/{id}
- Actualizar producto — PUT - /api/productos/{id}
- Eliminar producto — DELETE - /api/productos/{id}

# Inicio de las pruebas

Para realizar las pruebas se inició la aplicación con:

mvn spring-boot:run

La aplicación quedó disponible en:
http://localhost:8080
La API utilizada fue:
http://localhost:8080/api/productos
---
# Verificación inicial de la API
Antes de crear un producto se realizó una consulta para comprobar que la API estuviera funcionando.
## Comando utilizado
curl.exe http://localhost:8080/api/productos

## Resultado obtenido
[]
Esto permitió comprobar que:
- La aplicación estaba ejecutándose.
- El endpoint estaba disponible.
- La base de datos no tenía productos registrados inicialmente.
---
# Prueba 1 — Crear producto

## Objetivo

Comprobar que el endpoint `POST` permite crear un nuevo producto.

## Método

POST
## Endpoint
/api/productos
## Comando utilizado
$body = @{
nombre = "Jamon Serrano"
categoria = "Jamones"
unidadMedida = "kg"
precioVenta = 25000
stockMinimo = 5
activo = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/productos" -Method Post -ContentType "application/json" -Body $body
## Datos enviados
Nombre: Jamon Serrano
Categoría: Jamones
Unidad de medida: kg
Precio de venta: 25000
Stock mínimo: 5
Activo: true
## Resultado obtenido
id : 1
nombre : Jamon Serrano
categoria : Jamones
unidadMedida : kg
precioVenta : 25000
stockMinimo : 5
activo : True
El servidor asignó el ID `1` al producto.
## Resultado HTTP
201 Created
### Estado
**Prueba exitosa.**
---
# Prueba 2 — Listar productos
## Objetivo
Comprobar que el endpoint `GET` permite consultar los productos registrados.
## Método
GET
## Endpoint
/api/productos
## Comando utilizado
curl.exe http://localhost:8080/api/productos
## Resultado obtenido
[
{
"id": 1,
"nombre": "Jamon Serrano",
"categoria": "Jamones",
"unidadMedida": "kg",
"precioVenta": 25000.00,
"stockMinimo": 5,
"activo": true
}
]
## Resultado HTTP
200 OK
### Estado
**Prueba exitosa.**
La respuesta permitió comprobar que el producto creado quedó registrado correctamente.
---
# Prueba 3 — Obtener producto por ID
## Objetivo
Comprobar que se puede consultar un producto específico utilizando su identificador.

## Método

GET

## Endpoint
/api/productos/1
## Comando utilizado
curl.exe http://localhost:8080/api/productos/1
## Resultado obtenido
{
"id": 1,
"nombre": "Jamon Serrano",
"categoria": "Jamones",
"unidadMedida": "kg",
"precioVenta": 25000.00,
"stockMinimo": 5,
"activo": true
}
## Resultado HTTP
200 OK
### Estado
**Prueba exitosa.**
---
# Prueba 4 — Actualizar producto
## Objetivo
Comprobar que el endpoint `PUT` permite actualizar un producto existente.
## Método
PUT
## Endpoint
/api/productos/1
## Comando utilizado
$body = @{
nombre = "Jamon Serrano"
categoria = "Jamones"
unidadMedida = "kg"
precioVenta = 28000
stockMinimo = 10
activo = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/productos/1" -Method Put -ContentType "application/json" -Body $body

## Cambios realizados
Precio de venta:
25000 → 28000
Stock mínimo:
5 → 10
## Resultado obtenido
id : 1
nombre : Jamon Serrano
categoria : Jamones
unidadMedida : kg
precioVenta : 28000
stockMinimo : 10
activo : True
## Resultado HTTP
200 OK

### Estado
**Prueba exitosa.**
La actualización permitió comprobar que los datos del producto fueron modificados correctamente.

---
# Prueba 5 — Eliminar producto

## Objetivo

Comprobar que el endpoint `DELETE` permite eliminar un producto existente.

## Método


DELETE


## Endpoint

/api/productos/1

## Comando utilizado

curl.exe -i -X DELETE http://localhost:8080/api/productos/1

El parámetro `-i` se utilizó para visualizar también los encabezados y el código de respuesta HTTP.
## Resultado obtenido

HTTP/1.1 204
Date: Mon, 05 Oct 2026 02:39:39 GMT

## Resultado HTTP

204 No Content

### Estado
**Prueba exitosa.**