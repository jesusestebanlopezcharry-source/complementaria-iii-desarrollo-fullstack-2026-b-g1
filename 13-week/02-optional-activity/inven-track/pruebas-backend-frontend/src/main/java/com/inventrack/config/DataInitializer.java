package com.inventrack.config;

import com.inventrack.auth.Usuario;
import com.inventrack.auth.UsuarioRepository;
import com.inventrack.entity.Producto;
import com.inventrack.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

/** Datos iniciales para desarrollo: usuario administrador y algunos productos de ejemplo. */
@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner cargarDatos(UsuarioRepository usuarios,
                                  ProductoRepository productos,
                                  PasswordEncoder encoder,
                                  @Value("${app.admin.username}") String adminUser,
                                  @Value("${app.admin.password}") String adminPass) {
        return args -> {
            if (usuarios.findByUsername(adminUser).isEmpty()) {
                usuarios.save(new Usuario(adminUser, encoder.encode(adminPass)));
            }
            if (productos.count() == 0) {
                productos.save(producto("Jamón Pietrán", "Jamones", "kg", "38500", 10));
                productos.save(producto("Queso doble crema", "Quesos", "kg", "29000", 8));
                productos.save(producto("Salchicha ranchera", "Salchichas", "unidad", "1800", 50));
                productos.save(producto("Mortadela", "Embutidos", "kg", "16500", 12));
            }
        };
    }

    private Producto producto(String nombre, String categoria, String unidad, String precio, int stockMinimo) {
        Producto p = new Producto();
        p.setNombre(nombre);
        p.setCategoria(categoria);
        p.setUnidadMedida(unidad);
        p.setPrecioVenta(new BigDecimal(precio));
        p.setStockMinimo(stockMinimo);
        return p;
    }
}
