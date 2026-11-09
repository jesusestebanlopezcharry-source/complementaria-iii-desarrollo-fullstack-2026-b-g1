#!/usr/bin/env bash
# Prueba el flujo de seguridad contra la API en marcha (mvn spring-boot:run).
# Uso: ./probar-flujo.sh [usuario] [clave]
BASE=http://localhost:8080
USER=${1:-admin}
PASS=${2:-admin123}

echo "1) Sin token  -> se espera 401"
curl -s -o /dev/null -w "   HTTP %{http_code}\n" "$BASE/api/productos"

echo "2) Login      -> se espera 200 y un token"
RESP=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER\",\"password\":\"$PASS\"}")
TOKEN=$(echo "$RESP" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
if [ -z "$TOKEN" ]; then echo "   No se obtuvo token. Respuesta: $RESP"; exit 1; fi
echo "   Token: ${TOKEN:0:30}..."

echo "3) Con token  -> se espera 200"
curl -s -o /dev/null -w "   HTTP %{http_code}\n" "$BASE/api/productos" \
  -H "Authorization: Bearer $TOKEN"

echo "4) Token falso -> se espera 401"
curl -s -o /dev/null -w "   HTTP %{http_code}\n" "$BASE/api/productos" \
  -H "Authorization: Bearer token.falso.123"
