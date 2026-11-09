# ---------- Etapa 1: construir el frontend (React + Vite) ----------
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---------- Etapa 2: construir el backend (Spring Boot + Maven) ----------
FROM maven:3.9-eclipse-temurin-17 AS backend
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
# El frontend compilado se sirve desde Spring Boot (mismo origen, sin CORS en produccion)
COPY --from=frontend /app/frontend/dist ./src/main/resources/static
RUN mvn -B -q package -DskipTests

# ---------- Etapa 3: imagen final, liviana y sin root ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=backend /app/target/*.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
