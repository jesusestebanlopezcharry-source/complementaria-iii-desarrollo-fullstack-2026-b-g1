package com.inventrack;

import com.inventrack.entity.Producto;
import com.inventrack.exception.RecursoDuplicadoException;
import com.inventrack.exception.RecursoNoEncontradoException;
import com.inventrack.repository.ProductoRepository;
import com.inventrack.service.ProductoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Pruebas unitarias del service: sin Spring ni base de datos, el repositorio es un mock. */
@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository repository;

    @InjectMocks
    private ProductoService service;

    private Producto producto(String nombre) {
        Producto p = new Producto();
        p.setNombre(nombre);
        return p;
    }

    @Test
    void obtenerPorIdExistenteDevuelveElProducto() {
        Producto esperado = producto("Mortadela");
        when(repository.findById(1L)).thenReturn(Optional.of(esperado));

        assertSame(esperado, service.obtenerPorId(1L));
    }

    // Caso de error: el id no existe
    @Test
    void obtenerPorIdInexistenteLanzaRecursoNoEncontrado() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        RecursoNoEncontradoException ex = assertThrows(
                RecursoNoEncontradoException.class, () -> service.obtenerPorId(999L));
        assertEquals("No existe un producto con id 999", ex.getMessage());
    }

    @Test
    void crearGuardaElProductoYIgnoraUnIdEnviadoPorElCliente() {
        Producto nuevo = producto("Queso costeño");
        nuevo.setId(77L); // el cliente intenta forzar un id
        when(repository.existsByNombreIgnoreCase("Queso costeño")).thenReturn(false);
        when(repository.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        Producto guardado = service.crear(nuevo);

        assertNull(guardado.getId());
        verify(repository).save(nuevo);
    }

    // Caso de error: nombre repetido -> 409 y NO se guarda nada
    @Test
    void crearConNombreDuplicadoLanzaExcepcionYNoGuarda() {
        when(repository.existsByNombreIgnoreCase("Jamón")).thenReturn(true);

        assertThrows(RecursoDuplicadoException.class, () -> service.crear(producto("Jamón")));
        verify(repository, never()).save(any());
    }

    // Caso límite: categoría en blanco se trata como "sin filtro"
    @Test
    void listarConCategoriaEnBlancoDevuelveTodos() {
        List<Producto> todos = List.of(producto("A"), producto("B"));
        when(repository.findAll()).thenReturn(todos);

        assertEquals(2, service.listar("   ").size());
        verify(repository, never()).findByCategoriaIgnoreCase(any());
    }

    @Test
    void listarConCategoriaFiltraPorCategoria() {
        when(repository.findByCategoriaIgnoreCase("Quesos")).thenReturn(List.of(producto("Doble crema")));

        assertEquals(1, service.listar("Quesos").size());
        verify(repository, never()).findAll();
    }
}
