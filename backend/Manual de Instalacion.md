# Manual de instalación y pruebas — OpsCore Backend

## 📌 Objetivo

Este manual explica cómo:

- Clonar el proyecto
- Configurar el backend localmente
- Levantar la aplicación Spring Boot
- Configurar PostgreSQL
- Ejecutar la aplicación
- Probar los endpoints usando Postman
- Usar autenticación JWT

---

## 🧰 Tecnologías utilizadas

- Java 17
- Spring Boot 3
- PostgreSQL
- Maven
- Spring Security + JWT
- Postman

---

# 📥 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
```

Entrar al proyecto:

```bash
cd opscore-api
```

---

# ☕ 2. Instalar Java 17

Verificar versión instalada:

```bash
java -version
```

Debe mostrar algo similar a:

```text
openjdk version "17"
```

## Si no está instalado

### Windows

Descargar JDK 17:

- Eclipse Temurin
- Oracle JDK

### Linux

```bash
sudo apt install openjdk-17-jdk
```

---

# 🐘 3. Instalar PostgreSQL

Instalar PostgreSQL 17 o superior.

Crear una base de datos:

```sql
CREATE DATABASE opscore;
```

---

# ⚙️ 4. Configurar variables en `application.properties`

Ubicación:

```text
src/main/resources/application.properties
```

Configurar:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/opscore_db
spring.datasource.username=postgres
spring.datasource.password=TU_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

# 📦 5. Instalar dependencias Maven

Desde terminal:

```bash
mvn clean install
```

O desde IntelliJ:

- Abrir panel Maven
- Ejecutar:
  - `clean`
  - `install`

---

# ▶️ 6. Ejecutar la aplicación

Desde terminal:

```bash
mvn spring-boot:run
```

O desde IntelliJ:

- Abrir clase:
  `OpscoreApiApplication`
- Ejecutar botón ▶ Run

---

# ✅ 7. Verificar inicio correcto

La consola debe mostrar algo similar a:

```text
Started OpscoreApiApplication
```

Y el servidor quedará disponible en:

```text
http://localhost:8080
```

---

# 👤 8. Usuario administrador inicial

Al iniciar la aplicación se crea automáticamente:

| Usuario | Password |
|----------|----------|
| admin | 1234 |

Rol:

```text
ADMIN
```

---

# 📬 9. Importar colección de Postman

## Importar colección

1. Abrir Postman
2. Click en:
   `Import`
3. Seleccionar archivo:
   `OpsCore.postman_collection.json`

---

# 🔐 10. Obtener JWT

Ejecutar request:

```http
POST http://localhost:8080/auth/login
```

Body:

```json
{
  "username": "admin",
  "password": "1234"
}
```

Respuesta esperada:

```json
{
  "token": "eyJhbGciOi..."
}
```

Copiar el token.

---

# 🪪 11. Configurar Bearer Token

## Opción recomendada

En Postman:

1. Abrir carpeta principal de la colección
2. Ir a pestaña:
   `Authorization`
3. Seleccionar:
   `Bearer Token`
4. Pegar token JWT
5. Guardar colección

---

## 📌 Importante

Todos los requests heredarán automáticamente el token.

Si un endpoint devuelve:

```text
401 Unauthorized
```

probablemente el token expiró.

En ese caso:

1. Ejecutar nuevamente `POST http://localhost:8080/auth/login`
2. Copiar nuevo token
3. Reemplazar Bearer Token

---

# 🧪 12. Flujo recomendado de pruebas

## 1. Login

```http
POST http://localhost:8080/auth/login
```
Body Request
```http
{
"username": "admin",
"password": "1234"
}
```
Body Response
```http
{
    "token": "eyJhbGciO..."
}
```

---

## 2. Crear incidente

```http
POST http://localhost:8080/incidents
```
Body request
```http
{
  "title": "Falla en línea de producción",
  "description": "La máquina se detuvo inesperadamente",
  "priority": "MEDIUM",
  "category": "OPERATIONS"
}
```
Body Response
```http
{
    "id": 1,
    "title": "Falla en línea de producción",
    "description": "La máquina se detuvo inesperadamente",
    "status": "OPEN",
    "priority": "MEDIUM",
    "category": "OPERATIONS",
    "createdAt": "2026-05-13T17:52:26.7008936",
    "resolvedAt": null
}
```

---

## 3. Asignar incidente

```http
POST http://localhost:8080/incidents/{id}/assign
```
Body Request
```http
{
  "assignedTo": "Juan Perez"
}
```

No tiene Body Response, devuelve 200 OK
 
---

## 4. Resolver incidente

```http
PATCH http://localhost:8080/incidents/{id}/resolve
```

No tiene Body Request.    
No tiene Body Response, devuelve 204 No Content

---

## 5. Gestión de usuarios

### Crear usuario

```http
POST http://localhost:8080/users
```
```http
Body Request
{
  "username": "operador",
  "password": "1235",
  "role": "OPERATOR"
}
```
Body Response
```http
{
    "id": 2,
    "username": "operador",
    "role": "OPERATOR"
}
```

### Obtener usuarios

```http
GET http://localhost:8080/users
```
Body Request none

Body Response
```http
[
    {
        "id": 1,
        "username": "admin",
        "role": "ADMIN"
    },
    {
        "id": 2,
        "username": "operador",
        "role": "OPERATOR"
    },
    {
        "id": 3,
        "username": "tecnico",
        "role": "TECHNICIAN"
    }   
]
```

### Actualizar rol

```http
PATCH http://localhost:8080/users/{id}/role
```
Body Request
```http
{
  "role": "OPERATOR"
}
```
Body Response
```http
{
    "id": {id},
    "username": "supervisor",
    "role": "OPERATOR"
}
```

### Desactivar usuario

```http
PATCH  http://localhost:8080/users/{id}/status 
```
Body Request
```http
{
  "enabled": true
}
```
Body Response
```http
{
    "id": 3,
    "username": "tecnico",
    "role": "TECHNICIAN"
} 
```

### Cambiar password
Cambia el password del usuario logeado
```http
PATCH  http://localhost:8080/users/change-password
```
Body Request
```http
{
  "currentPassword": "1234",
  "newPassword": "abcd"
}
```
Body Response
```http
{
    "token": "eyJhbGciOi...."
}
```
Para ejecutar las Request es necesario volver 
iniciar sesion, con la nueva contraseña

---

# 👥 Roles disponibles

| Rol | Descripción |
|------|-------------|
| ADMIN | Acceso total |
| SUPERVISOR | Asigna incidentes |
| TECHNICIAN | Resuelve incidentes |
| OPERATOR | Crea incidentes |
| MANAGER | Consulta métricas y reportes |

---

# 🔒 Seguridad implementada

- JWT Authentication
- Spring Security
- RBAC (Role-Based Access Control)
- BCrypt password encryption
- Protected endpoints
- User activation/deactivation
- Global exception handling

---

# ⚠️ Problemas comunes

## 1. Error 401 Unauthorized

### Causa

Token inválido o expirado.

### Solución

- Ejecutar login nuevamente
- Copiar nuevo token JWT
- Actualizar Bearer Token en Postman

---

## 2. Error 403 Forbidden

### Causa

El usuario no tiene permisos suficientes.

### Solución

Verificar el rol del usuario.

---

## 3. Error de conexión PostgreSQL

### Causa

PostgreSQL apagado o credenciales incorrectas.

### Solución

Verificar:

```properties
spring.datasource.username
spring.datasource.password
```

---

## 4. Maven no descarga dependencias

### Solución

```bash
mvn clean install -U
```

---

# 📂 Archivos recomendados para compartir

Compartir:

- Repositorio GitHub
- NoCountry		https://github.com/No-Country-simulation/S03-26-Equipo-09-Web-App-Development
- personal		https://github.com/IngRodrigoPena/s04-26-e26-wad 


- Colección Postman
- 


---

# 🚀 Estado actual del backend

## Funcionalidades implementadas

- CRUD de incidentes
- Asignación de incidentes
- Historial de asignaciones
- Resolución de incidentes
- JWT Authentication
- RBAC
- Gestión de usuarios
- Cambio de password
- Activación/desactivación de usuarios
- Manejo global de errores

---

# 📊 Próximas funcionalidades

- Dashboard y métricas
- Swagger/OpenAPI
- Seeder de datos
- Notificaciones
- Reportes