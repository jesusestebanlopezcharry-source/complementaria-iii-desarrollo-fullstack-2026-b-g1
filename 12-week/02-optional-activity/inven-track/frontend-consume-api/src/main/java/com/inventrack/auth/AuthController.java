package com.inventrack.auth;

import com.inventrack.exception.CredencialesInvalidasException;
import com.inventrack.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // POST /api/auth/login  ->  { "token": "...", "tipo": "Bearer", ... }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(request.username())
                .filter(u -> passwordEncoder.matches(request.password(), u.getPassword()))
                // Mismo mensaje si falla el usuario o la clave: no revelar cuál fue
                .orElseThrow(() -> new CredencialesInvalidasException("Usuario o contraseña incorrectos"));

        String token = jwtService.generarToken(usuario.getUsername());
        return ResponseEntity.ok(new LoginResponse(
                token, "Bearer", jwtService.getExpiracionMinutos(), usuario.getUsername()));
    }
}
