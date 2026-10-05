package com.inventrack.service;

import com.inventrack.entity.Producto;
import com.inventrack.exception.RecursoDuplicadoException;
import com.inventrack.exception.RecursoNoEncontradoException;
import com.inventrack.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @Transactional(readOnly = true)
    public List<Producto> listar(String categoria) {
        if (categoria != null && !categoria.isBlank()) {
            return productoRepository.findByCategoriaIgnoreCase(categoria);
        }
        return productoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Producto obtenerPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un producto con id " + id));
    }

    @Transactional
    public Producto crear(Producto producto) {
        if (productoRepository.existsByNombreIgnoreCase(producto.getNombre())) {
            throw new RecursoDuplicadoException(
                    "Ya existe un producto con el nombre '" + producto.getNombre() + "'");
        }
        producto.setId(null);
        return productoRepository.save(producto);
    }

    @Transactional
    public Producto actualizar(Long id, Producto datos) {
        Producto existente = obtenerPorId(id);

        if (productoRepository.existsByNombreIgnoreCaseAndIdNot(datos.getNombre(), id)) {
            throw new RecursoDuplicadoException(
                    "Ya existe otro producto con el nombre '" + datos.getNombre() + "'");
        }

        existente.setNombre(datos.getNombre());
        existente.setCategoria(datos.getCategoria());
        existente.setUnidadMedida(datos.getUnidadMedida());
        existente.setPrecioVenta(datos.getPrecioVenta());
        existente.setStockMinimo(datos.getStockMinimo());
        if (datos.getActivo() != null) {
            existente.setActivo(datos.getActivo());
        }
        return productoRepository.save(existente);
    }

    @Transactional
    public void eliminar(Long id) {
        Producto existente = obtenerPorId(id);
        productoRepository.delete(existente);
    }
}
