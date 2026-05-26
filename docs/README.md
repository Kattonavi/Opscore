# s04-26-e26-wad

# OpsCore Backend API

Backend del sistema OpsCore desarrollado con Spring Boot para la gestión de incidentes, autenticación, asignaciones y seguimiento operativo.

---

# 🚀 Tecnologías utilizadas

- Java 17
- Spring Boot
- Spring Security
- JWT Authentication
- PostgreSQL
- Maven
- JPA / Hibernate
- Lombok
- Postman
- Git & GitHub

---

# 📂 Estructura del proyecto

```plaintext
OpsCore
│
├── backend
│   └── opscore-api
│
├── docs
│
└── README.md
```

---

# 🔐 Funcionalidades implementadas

## Autenticación y Seguridad

- Login con JWT
- Generación de token
- Validación de token
- Filtro JWT personalizado
- Spring Security Configuration
- Endpoints protegidos

---

## Gestión de Usuarios

- CRUD de usuarios
- Validaciones
- Roles
- Manejo de errores

---

## Gestión de Incidentes

- Crear incidente
- Obtener incidentes
- Actualizar incidentes
- Cambiar estado
- Resolver incidente
- Cerrar incidente

---

## Asignación de Incidentes

- Asignación de incidentes a usuarios
- Historial de asignaciones
- Validaciones de negocio

---

# 📌 Endpoints principales

## Auth / Login

| Request    | Método | Endpoint |
|------------|---|---|
| loging | POST | `http://localhost:8080/auth/login` |

---

## Usuarios

| Request        | Método      | Endpoint                                  |
|----------------|-------------|-------------------------------------------|
| create         | POST        | `http://localhost:8080/users`             |
| *findById      | GET         | `http://localhost:8080/users/{id}`        |
| listAll        | GET         | `http://localhost:8080/users`             |
| *update        | PUT         | `http://localhost:8080/users/{id}`        |
| delete         | DELETE      | `http://localhost:8080/users/{id}`        |
| updateStatus   | PATCH | `http://localhost:8080/users/{id}/status` |
| updateRole     | PATCH | `http://localhost:8080/users/{id}/role`  |
| changePassword | PATCH | `http://localhost:8080/users/change-password`  |

---

## Incidentes

| Request      | Método | Endpoint                                       |
|--------------|---|------------------------------------------------|
| getALL       | GET | `http://localhost:8080/incidents`              |
| create       | POST    | `http://localhost:8080/incidents`              |
| findById     | GET | `http://localhost:8080/incidents{id}`          |
| *update      | PUT       | `http://localhost:8080/incidents/{id}`         |
| *delete      | DELETE      | `http://localhost:8080/users/{id}`             |
| resolve | PATCH    | `http://localhost:8080/incidents/{id}/resolve` |

---
## Asignamientos

| Request  | Método                       | Endpoint                                       |
|----------|------------------------------|------------------------------------------------|
| assign   | POST                         | `http://localhost:8080/incidents/{id}/assign` |

---

# 🧪 Testing con Postman

La colección de Postman se encuentra en:

```plaintext
docs/OpsCore.postman_collection.json
```

Importar la colección en Postman para probar los endpoints.

---

# ⚙️ Configuración local

## 1. Clonar repositorio

```bash
git clone <repository-url>
```

---

## 2. Configurar PostgreSQL

Crear base de datos:

```sql
CREATE DATABASE opscore;
```

---

## 3. Configurar variables en `application.properties`

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/opscore_db
spring.datasource.username=postgres
spring.datasource.password=your_password
```

---

## 4. Ejecutar aplicación

```bash
mvn spring-boot:run
```

---

# 🔑 Autenticación JWT

## Obtener token

```http
POST http://localhost:8080/auth/login
```

Ejemplo:

```json
{
  "email": "admin@test.com",
  "password": "123456"
}
```

---

## Usar token

Agregar header:

```http
Authorization: Bearer <token>
```

---

# 📘 Documentación adicional

La carpeta `docs/` contiene:

- Manual de instalación
- Colección Postman
- Guías de autenticación
- Troubleshooting
- Diagramas y documentación técnica

---

# 🛠️ Problemas encontrados y soluciones

## Error: JWT filter bloqueando endpoints públicos

### Solución
Se agregaron validaciones para excluir endpoints públicos del filtro JWT.

---

## Error: relaciones JPA causando recursión infinita

### Solución
Uso de DTOs y anotaciones de serialización.

---

## Error: conflictos de ramas Git

### Solución
Uso de feature branches independientes y PRs separados.

---

# 👥 Equipo

Proyecto desarrollado en colaboración con el equipo de NoCountry.

---

# 📄 Estado del proyecto

En desarrollo activo 🚧
