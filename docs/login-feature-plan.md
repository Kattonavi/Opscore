# 🚀 Feature Login - Plan de Implementación

## 📋 Resumen

Este directorio contiene el plan completo para implementar el sistema de autenticación usando **Screaming Architecture**.

## 🏗️ Estructura del Feature

```
frontend/
├── features/
│   └── auth/                      # 🎯 Feature: Autenticación
│       ├── api/
│       │   ├── client.ts          # Axios client
│       │   ├── auth/
│       │   │   ├── api.ts         # Endpoints auth
│       │   │   ├── types.ts       # DTOs
│       │   │   └── index.ts
│       │   ├── users/
│       │   │   ├── api.ts         # Endpoints users
│       │   │   ├── types.ts       # DTOs
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── stores/
│       │   └── auth-store.ts      # Zustand store
│       ├── components/
│       │   ├── login-form.tsx     # Formulario login
│       │   └── user-menu.tsx      # Menú usuario
│       └── hooks/
│           └── use-auth.ts        # Hook opcional
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   └── (dashboard)/
│       └── layout.tsx
└── middleware.ts                  # Protección de rutas
```

## 📚 Issues a Crear

### Epic
1. **epic-login.md** - Epic principal del feature

### Modules
2. **module-api.md** - API Client y tipos
3. **module-store.md** - Auth Store con Zustand
4. **module-ui.md** - Login Page UI

### Task
5. **task-integration.md** - Integración y middleware

## 🔌 Backend Endpoints (YA EXISTEN)

- `POST /auth/login` - Login → retorna token JWT
- `GET /users/me` - Usuario actual
- `POST /users` - Crear usuario (ADMIN)
- `GET /users` - Listar usuarios (ADMIN)
- `PATCH /users/{id}/role` - Cambiar rol (ADMIN)
- `PATCH /users/{id}/status` - Cambiar estado (ADMIN)
- `PATCH /users/change-password` - Cambiar password

## 🎨 Diseño

- Logo: 🐦‍🔥 (phoenix)
- Tema: Stone con ámbar (ya configurado)
- Formulario con validación Zod
- Estados: loading, error, success

## 📦 Dependencias

```bash
# Ya instaladas en el proyecto
- zustand
- axios
- zod
- react-hook-form
- @hookform/resolvers

# Instalar componentes shadcn/ui
npx shadcn@latest add card form input label alert avatar
```

## 🚀 Orden de Implementación

1. **API Client** (module-api) - Base para comunicación
2. **Auth Store** (module-store) - Estado global
3. **Login UI** (module-ui) - Interfaz
4. **Integración** (task-integration) - Middleware y protección

## ⏱️ Estimación Total

- **API Client:** 1 día
- **Auth Store:** 1 día
- **Login UI:** 1-2 días
- **Integración:** 1 día

**Total:** 4-5 días

## ✅ Criterios de Aceptación

- [ ] Login funcional con email/password
- [ ] Token JWT persiste en localStorage
- [ ] Interceptor de Axios agrega token
- [ ] Página de login con logo 🐦‍🔥
- [ ] Validación de campos con Zod
- [ ] Redirección al dashboard
- [ ] Botón de logout
- [ ] Middleware protege rutas

## 📝 Notas

- Usar **Screaming Architecture**: `features/auth/`
- Separación de responsabilidades clara
- Zustand para estado global
- Backend ya tiene endpoints listos
- Tema Stone/ámbar ya configurado

---

**Worktree:** `.worktrees/feature-login/`  
**Rama:** `feature/login`  
**Prioridad:** Alta 🔥
