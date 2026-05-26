# OpsCore API - Documentación de Roles y Permisos

## Roles del Sistema

El sistema cuenta con 5 roles definidos:

| Rol | Descripción | Permisos Principales |
|-----|-------------|---------------------|
| **ADMIN** | Administrador del sistema | Acceso total a todas las funcionalidades |
| **MANAGER** | Gerente/Manager | Gestión de incidentes, reportes y usuarios |
| **SUPERVISOR** | Supervisor de operaciones | Asignación de incidentes, visualización de reportes |
| **TECHNICIAN** | Técnico de soporte | Resolución de incidentes asignados |
| **OPERATOR** | Operador/Usuario | Creación y seguimiento de incidentes |

---

## Endpoints por Rol

### 🔴 ADMIN
**Acceso Total**

- **Usuarios** (`/users`)
  - `POST /users` - Crear usuarios
  - `GET /users` - Listar todos los usuarios
  - `PATCH /users/{id}/role` - Cambiar rol de usuario
  - `PATCH /users/{id}/status` - Activar/Desactivar usuario

- **Incidentes** (`/incidents`)
  - `POST /incidents` - Crear incidente
  - `GET /incidents` - Listar todos los incidentes
  - `GET /incidents/{id}` - Ver detalle de incidente
  - `PATCH /incidents/{id}/resolve` - Resolver incidente
  - `GET /incidents/{id}/assignments` - Ver historial de asignaciones

- **Asignaciones** (`/incidents/{id}/assign`)
  - `POST /incidents/{id}/assign` - Asignar técnico a incidente

- **Autenticación** (`/auth`)
  - `POST /auth/login` - Iniciar sesión

- **Contraseña** (`/users`)
  - `PATCH /users/change-password` - Cambiar contraseña propia

### 🟣 MANAGER
**Gestión y Reportes**

- **Incidentes** (`/incidents`)
  - `POST /incidents` - Crear incidente
  - `GET /incidents` - Listar todos los incidentes
  - `GET /incidents/{id}` - Ver detalle de incidente
  - `GET /incidents/{id}/assignments` - Ver historial de asignaciones

- **Asignaciones** (`/incidents/{id}/assign`)
  - `POST /incidents/{id}/assign` - Asignar técnico a incidente

- **Autenticación** (`/auth`)
  - `POST /auth/login` - Iniciar sesión

- **Contraseña** (`/users`)
  - `PATCH /users/change-password` - Cambiar contraseña propia

### 🔵 SUPERVISOR
**Supervisión y Asignación**

- **Incidentes** (`/incidents`)
  - `POST /incidents` - Crear incidente
  - `GET /incidents` - Listar todos los incidentes
  - `GET /incidents/{id}` - Ver detalle de incidente
  - `GET /incidents/{id}/assignments` - Ver historial de asignaciones

- **Asignaciones** (`/incidents/{id}/assign`)
  - `POST /incidents/{id}/assign` - Asignar técnico a incidente

- **Autenticación** (`/auth`)
  - `POST /auth/login` - Iniciar sesión

- **Contraseña** (`/users`)
  - `PATCH /users/change-password` - Cambiar contraseña propia

### 🟠 TECHNICIAN
**Resolución de Incidentes**

- **Incidentes** (`/incidents`)
  - `POST /incidents` - Crear incidente
  - `GET /incidents` - Listar todos los incidentes (filtrados por asignación)
  - `GET /incidents/{id}` - Ver detalle de incidente asignado
  - `PATCH /incidents/{id}/resolve` - Resolver incidente asignado
  - `GET /incidents/{id}/assignments` - Ver historial de asignaciones

- **Autenticación** (`/auth`)
  - `POST /auth/login` - Iniciar sesión

- **Contraseña** (`/users`)
  - `PATCH /users/change-password` - Cambiar contraseña propia

### ⚪ OPERATOR
**Creación de Incidentes**

- **Incidentes** (`/incidents`)
  - `POST /incidents` - Crear incidente
  - `GET /incidents` - Listar incidentes creados por el usuario
  - `GET /incidents/{id}` - Ver detalle de incidente propio
  - `GET /incidents/{id}/assignments` - Ver historial de asignaciones

- **Autenticación** (`/auth`)
  - `POST /auth/login` - Iniciar sesión

- **Contraseña** (`/users`)
  - `PATCH /users/change-password` - Cambiar contraseña propia

---

## Navegación del Dashboard por Rol

### ADMIN
- ✅ Dashboard
- ✅ Incidentes (crear, ver, resolver)
- ✅ Reportes/Canvas
- ✅ Usuarios (gestión completa)
- ✅ Asignaciones

### MANAGER
- ✅ Dashboard
- ✅ Incidentes (crear, ver)
- ✅ Reportes/Canvas
- ✅ Usuarios (gestión)
- ✅ Asignaciones

### SUPERVISOR
- ✅ Dashboard
- ✅ Incidentes (crear, ver)
- ✅ Reportes/Canvas
- ❌ Usuarios (no tiene acceso)
- ✅ Asignaciones

### TECHNICIAN
- ✅ Dashboard
- ✅ Incidentes (ver asignados, resolver)
- ❌ Reportes/Canvas (no tiene acceso)
- ❌ Usuarios (no tiene acceso)
- ❌ Asignaciones (solo recibe, no asigna)

### OPERATOR
- ✅ Dashboard
- ✅ Incidentes (crear, ver propios)
- ❌ Reportes/Canvas (no tiene acceso)
- ❌ Usuarios (no tiene acceso)
- ❌ Asignaciones (no tiene acceso)

---

## Permisos en el Frontend

```typescript
// Crear incidente
[ADMIN, MANAGER, SUPERVISOR, OPERATOR]

// Asignar incidente
[ADMIN, MANAGER, SUPERVISOR]

// Resolver incidente
[ADMIN, TECHNICIAN]

// Gestionar usuarios
[ADMIN, MANAGER]

// Ver reportes
[ADMIN, MANAGER, SUPERVISOR]
```

---

## Códigos de Estado HTTP

- `200 OK` - Petición exitosa
- `201 Created` - Recurso creado exitosamente
- `204 No Content` - Operación exitosa sin contenido de respuesta
- `400 Bad Request` - Datos de entrada inválidos
- `401 Unauthorized` - No autenticado o token inválido
- `403 Forbidden` - Sin permisos para acceder al recurso
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error interno del servidor

---

## Autenticación

Todas las peticiones (excepto login) requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

El token se obtiene al hacer login exitosamente y tiene una duración de 24 horas.

---

## Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | 1234 | ADMIN |
| manager | 1234 | MANAGER |
| supervisor | 1234 | SUPERVISOR |
| technician | 1234 | TECHNICIAN |
| operator | 1234 | OPERATOR |
