package com.inventrack.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey clave;
    private final long expiracionMinutos;

    public JwtService(@Value("${app.jwt.secret}") String secreto,
                      @Value("${app.jwt.expiration-minutes}") long expiracionMinutos) {
        byte[] bytes = secreto.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "app.jwt.secret debe tener al menos 32 caracteres (JWT_SECRET)");
        }
        this.clave = Keys.hmacShaKeyFor(bytes);
        this.expiracionMinutos = expiracionMinutos;
    }

    public String generarToken(String username) {
        Date ahora = new Date();
        Date expira = new Date(ahora.getTime() + expiracionMinutos * 60_000L);
        return Jwts.builder()
                .subject(username)
                .issuedAt(ahora)
                .expiration(expira)
                .signWith(clave)
                .compact();
    }

    /**
     * Devuelve el username si el token es válido (firma correcta y no vencido).
     * Lanza JwtException / IllegalArgumentException si no lo es.
     */
    public String validarYObtenerUsername(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(clave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    public long getExpiracionMinutos() {
        return expiracionMinutos;
    }
}
