package com.inventrack;

import com.inventrack.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProductoSeguridadTest {

    private static final String ORIGEN_FRONTEND = "http://localhost:5173";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private String bearer() {
        return "Bearer " + jwtService.generarToken("admin");
    }

    // Caso de error: sin token -> 401
    @Test
    void listarSinTokenDevuelve401() throws Exception {
        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isUnauthorized());
    }

    // Caso de error: token manipulado -> 401
    @Test
    void listarConTokenInvalidoDevuelve401() throws Exception {
        mockMvc.perform(get("/api/productos")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer esto.no.es.un.jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listarConTokenValidoDevuelve200() throws Exception {
        mockMvc.perform(get("/api/productos")
                        .header(HttpHeaders.AUTHORIZATION, bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(0))));
    }

    @Test
    void crearProductoConTokenDevuelve201() throws Exception {
        String nombre = "Producto " + UUID.randomUUID();
        mockMvc.perform(post("/api/productos")
                        .header(HttpHeaders.AUTHORIZATION, bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"" + nombre + "\",\"categoria\":\"Jamones\","
                                + "\"unidadMedida\":\"kg\",\"precioVenta\":38500,\"stockMinimo\":10}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value(nombre));
    }

    // Caso de error: autenticado pero con datos inválidos -> 400 (la validación sigue funcionando)
    @Test
    void crearProductoInvalidoConTokenDevuelve400() throws Exception {
        mockMvc.perform(post("/api/productos")
                        .header(HttpHeaders.AUTHORIZATION, bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"\",\"categoria\":\"Jamones\","
                                + "\"unidadMedida\":\"kg\",\"precioVenta\":38500,\"stockMinimo\":10}"))
                .andExpect(status().isBadRequest());
    }

    // CORS: el origen del frontend puede hacer el preflight
    @Test
    void corsPermiteOrigenDelFrontend() throws Exception {
        mockMvc.perform(options("/api/productos")
                        .header(HttpHeaders.ORIGIN, ORIGEN_FRONTEND)
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, ORIGEN_FRONTEND));
    }

    // Caso de error CORS: un origen no autorizado es rechazado
    @Test
    void corsRechazaOrigenNoAutorizado() throws Exception {
        mockMvc.perform(options("/api/productos")
                        .header(HttpHeaders.ORIGIN, "http://sitio-malicioso.example")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isForbidden());
    }
}
