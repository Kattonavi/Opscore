# 📦 Module: API Client y Tipos de Autenticación

## 📋 Descripción
Crear el cliente HTTP con Axios y definir todos los tipos/interfaces para la autenticación.

## 🎯 Tareas

### 1. Crear API Client Base
**Archivo:** `features/auth/api/client.ts`

```typescript
// Configuración de Axios con:
// - Base URL desde env
// - Timeout
// - Interceptor de request (agrega token)
// - Interceptor de response (manejo de errores 401)
```

### 2. Crear Tipos DTO
**Archivo:** `features/auth/api/auth/types.ts`

```typescript
export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  SUPERVISOR = 'SUPERVISOR',
  TECHNICIAN = 'TECHNICIAN',
}

export interface UserResponseDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  area: string | null;
  active: boolean;
  avatar: string | null;
}

export interface CreateUserRequestDTO {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}
```

### 3. Crear Auth API
**Archivo:** `features/auth/api/auth/api.ts`

Endpoints:
- `login(credentials)` → POST /auth/login
- `setToken(token)` → Guarda en localStorage
- `getToken()` → Obtiene de localStorage
- `removeToken()` → Elimina de localStorage
- `isAuthenticated()` → Boolean

### 4. Crear Users API
**Archivo:** `features/auth/api/users/api.ts`

Endpoints:
- `create(userData)` → POST /users (ADMIN)
- `getAll()` → GET /users (ADMIN)
- `me()` → GET /users/me
- `updateRole(id, data)` → PATCH /users/{id}/role (ADMIN)
- `updateStatus(id, data)` → PATCH /users/{id}/status (ADMIN)
- `changePassword(data)` → PATCH /users/change-password

### 5. Barrel Exports
**Archivos:**
- `features/auth/api/auth/index.ts`
- `features/auth/api/users/index.ts`
- `features/auth/api/index.ts`

## ✅ Checklist
- [ ] Axios client configurado con interceptores
- [ ] Todos los DTOs definidos
- [ ] Auth API implementada
- [ ] Users API implementada
- [ ] Manejo de errores 401/403/500
- [ ] Barrel exports creados
- [ ] Tests con MSW (opcional)

## 🔗 Relacionado con
- Epic #X - Feature Login

## 🌿 Rama
`feature/login/api`

---
**Estimación:** 1 día
