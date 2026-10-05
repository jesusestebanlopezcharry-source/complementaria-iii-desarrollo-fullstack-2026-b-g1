## Actividad 7. Entity, Repository y operaciones CRUD

### 1. Objetivo

Modelar una entidad para representar un caso propio, definir un repositorio que permita gestionar sus datos y explicar las operaciones CRUD utilizadas en el sistema Inven-Track.

### 2. Caso de uso

Inven-Track es un sistema de inventario que permite gestionar productos. Para representar la información de cada producto se implementó la entidad `Producto`, que contiene los atributos necesarios para identificarlo y administrar sus datos.

### 3. Modelado de la entidad

La entidad se encuentra en el archivo `Producto.java`, ubicado en el paquete `com.inventrack.entity`.

La clase utiliza las siguientes anotaciones:

- `@Entity`: indica que la clase es una entidad gestionada por JPA.
- `@Table(name = "productos")`: especifica el nombre de la tabla asociada en la base de datos.
- `@Id`: identifica la clave primaria de la entidad.
- `@GeneratedValue(strategy = GenerationType.IDENTITY)`: configura la generación automática del identificador.
- `@Column`: permite establecer características de las columnas, como obligatoriedad, longitud y precisión.

Los atributos definidos son:

| Atributo | Descripción |
|---|---|
| `id` | Identificador único del producto. |
| `nombre` | Nombre del producto. |
| `categoria` | Categoría a la que pertenece. |
| `unidadMedida` | Unidad utilizada para medir el producto. |
| `precioVenta` | Precio de venta del producto. |
| `stockMinimo` | Cantidad mínima de existencias definida. |
| `activo` | Indica si el producto se encuentra activo. |

También se implementaron validaciones para controlar campos obligatorios, longitudes y valores numéricos permitidos.

### 4. Definición del Repository

El repositorio se encuentra en el archivo `ProductoRepository.java`, dentro del paquete `com.inventrack.repository`.

La interfaz extiende `JpaRepository<Producto, Long>`. Esto permite utilizar las operaciones proporcionadas por Spring Data JPA para consultar, guardar, actualizar y eliminar registros sin tener que implementar manualmente todas las consultas básicas.

#### Consulta por método

Se implementó el siguiente método:

`List<Producto> findByCategoriaIgnoreCase(String categoria);`

Este método permite consultar los productos por categoría sin distinguir entre mayúsculas y minúsculas. Por ejemplo, permite buscar productos cuya categoría sea `Jamones`, independientemente de cómo se escriba la capitalización del término.

Adicionalmente, se definieron métodos para comprobar si un producto ya existe por nombre y para verificar nombres duplicados al actualizar un registro.

### 5. Operaciones CRUD

Las operaciones CRUD corresponden a las acciones básicas para gestionar los registros de una base de datos.

| Operación | Método de Spring Data JPA | Aplicación en Inven-Track |
|---|---|---|
| Create (Crear) | `save()` | Registrar un nuevo producto. |
| Read (Leer) | `findAll()`, `findById()` | Consultar todos los productos o buscar uno por su identificador. |
| Update (Actualizar) | `save()` | Guardar los cambios de un producto existente. |
| Delete (Eliminar) | `deleteById()` | Eliminar un producto por su identificador. |

En la operación de actualización, el producto existente se recupera y se modifican sus atributos antes de guardar los cambios. El servicio de la aplicación coordina estas operaciones y aplica las validaciones correspondientes.

### 6. Estructura de archivos relacionados

Los archivos principales que evidencian el desarrollo de esta actividad son:

- `src/main/java/com/inventrack/entity/Producto.java`
- `src/main/java/com/inventrack/repository/ProductoRepository.java`
- `README.md`

El proyecto conserva las capas `service` y `controller`, que se utilizan para implementar y exponer las operaciones del sistema mediante una API REST.

### 7. Resultado

Se definió la entidad `Producto` con sus atributos y mapeo a la tabla `productos`. Asimismo, se estableció el repositorio `ProductoRepository`, que hereda las operaciones de `JpaRepository` e incorpora consultas derivadas para buscar productos por categoría y verificar nombres existentes.

Con esta estructura se establecen las bases para gestionar los productos del inventario y continuar con la implementación del CRUD REST en la siguiente actividad.