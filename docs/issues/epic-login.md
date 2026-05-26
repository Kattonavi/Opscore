# 🚀 Epic: Feature Login con Screaming Architecture

## 📋 Descripción
Implementar el sistema de autenticación (login/logout) para la aplicación siguiendo Screaming Architecture, separación de responsabilidades y usando Zustand para el estado global.

## 🎯 Objetivo
Crear un flujo de autenticación completo que integre el frontend con el backend existente (`/auth/login`, `/users/me`).

## 🏗️ Arquitectura

```
frontend/
├── app/
│   └── (auth)/
│       └── login/
│           └── page.tsx          # Página de login
├── features/
│   └── auth/                      # 🎯 Screaming Architecture
│       ├── api/
│       │   ├── client.ts          # Axios client con interceptores
│       │   ├── auth/
│       │   │   ├── api.ts         # Endpoints de auth
│       │   │   ├── types.ts       # DTOs y tipos
│       │   │   └── index.ts       # Barrel export
│       │   └── users/
│       │       ├── api.ts         # Endpoints de users
│       │       ├── types.ts       # DTOs
│       │       └── index.ts
│       ├── stores/
│       │   └── auth-store.ts      # Zustand store
│       ├── components/
│       │   └── login-form.tsx     # Componente del formulario
│       └── hooks/
│           └── use-auth.ts        # Hook de autenticación
├── components/ui/                 # shadcn/ui components
└── lib/
    └── utils.ts                   # Utilidades
```

## 🔌 Backend Endpoints (YA EXISTEN)
- `POST /auth/login` - Login con email/password → retorna token JWT
- `GET /users/me` - Obtener usuario actual
- `POST /users` - Crear usuario (ADMIN)
- `GET /users` - Listar usuarios (ADMIN)
- `PATCH /users/{id}/role` - Cambiar rol (ADMIN)
- `PATCH /users/{id}/status` - Cambiar estado (ADMIN)
- `PATCH /users/change-password` - Cambiar password

## 🎨 Diseño
- Usar tema Stone con ámbar ya configurado
- Logo 🐦‍🔥 en la página de login
- Formulario con validación Zod
- Estados de loading y error

## 📦 Dependencias a usar
- `zustand` - State management
- `axios` - HTTP client
- `zod` - Validación de schemas
- `@hookform/resolvers` - Integración react-hook-form con zod
- `react-hook-form` - Formularios
- shadcn/ui components (Button, Input, Form, Card, Label)

## ✅ Criterios de Aceptación
- [ ] Usuario puede iniciar sesión con email/password
- [ ] Token JWT se guarda en localStorage
- [ ] Estado de autenticación persiste con Zustand + persist middleware
- [ ] Interceptor de Axios agrega token automáticamente
- [ ] Página de login tiene diseño con logo 🐦‍🔥
- [ ] Validación de campos con mensajes de error
- [ ] Redirección al dashboard tras login exitoso
- [ ] Botón de logout funcional
- [ ] Manejo de errores (401, 403, 500)

## 🔗 Issues Relacionados
- #X - Module: API Client con Axios
- #X - Module: Auth Store con Zustand
- #X - Module: Login Page UI

## 🌿 Rama
`feature/login`

---
**Prioridad:** Alta  
**Estimación:** 3-5 días  
**Asignado:** @davidcoachdev
