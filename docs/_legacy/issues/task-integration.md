# 🔗 Task: Integración y Middleware de Auth

## 📋 Descripción
Integrar todos los módulos (API, Store, UI) y crear middleware de protección de rutas.

## 🎯 Tareas

### 1. Crear Middleware de Autenticación
**Archivo:** `middleware.ts` (raíz del proyecto)

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Rutas públicas
  const publicRoutes = ["/login", "/register", "/forgot-password"];
  
  // Si está en ruta pública y tiene token, redirigir al dashboard
  if (publicRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Si está en ruta protegida y no tiene token, redirigir al login
  if (!publicRoutes.includes(pathname) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### 2. Crear Layout de Auth
**Archivo:** `app/(auth)/layout.tsx`

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
```

### 3. Crear Layout de Dashboard (Protegido)
**Archivo:** `app/(dashboard)/layout.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/stores/auth-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      {/* Header con UserMenu */}
      {/* Sidebar */}
      <main>{children}</main>
    </div>
  );
}
```

### 4. Crear UserMenu Component
**Archivo:** `features/auth/components/user-menu.tsx`

```typescript
"use client";

import { useAuthStore } from "@/features/auth/stores/auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 5. Actualizar Header con UserMenu
**Archivo:** `components/header.tsx`

Agregar el UserMenu al header cuando el usuario está autenticado.

### 6. Integración Final
- Probar flujo completo: Login → Dashboard → Logout
- Verificar persistencia del token
- Verificar redirecciones
- Probar manejo de errores

## ✅ Checklist
- [ ] Middleware de autenticación funcional
- [ ] Layout de auth creado
- [ ] Layout de dashboard protegido
- [ ] UserMenu component creado
- [ ] Logout funcional
- [ ] Redirecciones correctas
- [ ] Header actualizado con UserMenu
- [ ] Tests de integración pasando
- [ ] Revisión de código completa

## 🔗 Relacionado con
- Epic #X - Feature Login
- Module #X - API Client
- Module #X - Auth Store
- Module #X - Login Page UI

## 🌿 Rama
`feature/login/integration`

---
**Estimación:** 1 día
