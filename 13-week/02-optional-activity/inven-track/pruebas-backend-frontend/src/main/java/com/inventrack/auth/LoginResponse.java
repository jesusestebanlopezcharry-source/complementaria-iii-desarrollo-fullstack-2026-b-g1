package com.inventrack.auth;

public record LoginResponse(String token, String tipo, long expiraEnMinutos, String username) {
}
