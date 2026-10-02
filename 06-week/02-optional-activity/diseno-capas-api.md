# Diseño de las capas de una API – Inven-Track

## 1. Caso seleccionado

Para este ejercicio se selecciona **Inven-Track**, un sistema de gestión de inventario para una salsamentaria.

Se tomará como ejemplo la gestión de los **productos**, donde la API permite consultar, crear, actualizar y eliminar productos del inventario.

La arquitectura de la API estará organizada en cuatro capas principales:

**Controller → Service → Repository → Entity**

---

## 2. Diagrama de la API en capas

```text
                         CLIENTE
                            │
                            ▼
                   ┌─────────────────┐
                   │    CONTROLLER   │
                   │ProductoController│
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │     SERVICE     │
                   │ ProductoService │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │    REPOSITORY   │
                   │ProductoRepository│
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │     ENTITY      │
                   │     Producto    │
                   └────────┬────────┘
                            │
                            ▼
                     BASE DE DATOS
```

El flujo comienza cuando el cliente realiza una solicitud a la API. El **Controller** recibe la solicitud, el **Service** procesa la lógica del negocio, el **Repository** se encarga del acceso a los datos y la **Entity** representa la información del producto.

---

## 3. Responsabilidad de cada capa

| Capa | Ejemplo en Inven-Track | Responsabilidad |
|---|---|---|
| **Controller** | `ProductoController` | Recibir las solicitudes HTTP del cliente y enviar las respuestas correspondientes. |
| **Service** | `ProductoService` | Contener y ejecutar la lógica del negocio relacionada con los productos. |
| **Repository** | `ProductoRepository` | Realizar el acceso y la persistencia de los datos en la base de datos. |
| **Entity** | `Producto` | Representar la información y estructura de un producto dentro del sistema. |

### Controller

El **Controller** es la puerta de entrada de la API. Recibe las solicitudes realizadas por el cliente, por ejemplo, una solicitud para consultar un producto.

En Inven-Track, `ProductoController` recibe las solicitudes relacionadas con los productos y se comunica con `ProductoService`.

### Service

El **Service** contiene la lógica del negocio. Su función es procesar la información recibida por el Controller y determinar qué operación debe realizarse.

En Inven-Track, `ProductoService` puede encargarse de consultar un producto, crear uno nuevo, actualizar su información o eliminarlo.

### Repository

El **Repository** se encarga de la comunicación con la base de datos. Su responsabilidad es realizar operaciones como buscar, guardar, actualizar o eliminar información.

En este caso, `ProductoRepository` permite acceder a los datos de los productos almacenados.

### Entity

La **Entity** representa los objetos principales del sistema y su estructura de datos.

En Inven-Track, `Producto` representa un producto del inventario y puede contener información como nombre, categoría, precio y cantidad disponible.

---

## 4. Endpoint de ejemplo

Un endpoint de ejemplo sería:

```text
GET /api/productos/1
```

Este endpoint permite consultar el producto cuyo identificador es `1`.

### Flujo de la solicitud

```text
Cliente
   │
   │ GET /api/productos/1
   ▼
ProductoController
   │
   ▼
ProductoService
   │
   ▼
ProductoRepository
   │
   ▼
Producto (Entity)
   │
   ▼
Base de datos
```

### ¿Por qué pasa por estas capas?

1. **Controller:** recibe la solicitud `GET /api/productos/1`.

2. **Service:** procesa la solicitud y aplica la lógica necesaria para consultar el producto.

3. **Repository:** busca el producto en la base de datos utilizando su identificador.

4. **Entity:** representa el producto encontrado y su información.

5. Finalmente, la respuesta regresa al cliente.

### Ejemplo de respuesta

```json
{
    "id": 1,
    "nombre": "Jamón",
    "categoria": "Embutidos",
    "precio": 25000,
    "cantidad": 20
}
```

---

## Conclusión

La arquitectura por capas permite separar las responsabilidades de la API.

En Inven-Track:

- **Controller:** recibe las solicitudes.
- **Service:** maneja la lógica del negocio.
- **Repository:** gestiona el acceso a los datos.
- **Entity:** representa la información del sistema.

Esta separación facilita la organización, el mantenimiento y la comprensión de la aplicación.