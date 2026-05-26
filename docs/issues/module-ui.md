# 🎨 Module: Login Page UI

## 📋 Descripción
Crear la página de login con formulario validado, diseño con logo 🐦‍🔥 y temática Stone/Ámbar.

## 🎯 Tareas

### 1. Crear Login Form Component
**Archivo:** `features/auth/components/login-form.tsx`

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useTranslations } from "@/components/providers/i18n-provider";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, loading, error, clearError } = useAuthStore();
  const t = useTranslations("auth");
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    clearError();
    try {
      await login(values);
      // Redirigir al dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      // Error ya está en el store
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t("loginTitle")}
        </CardTitle>
        <CardDescription className="text-center">
          {t("loginDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="email@ejemplo.com" 
                      type="email"
                      disabled={loading}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("password")}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="••••••••" 
                      type="password"
                      disabled={loading}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("loggingIn")}
                </>
              ) : (
                t("loginButton")
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

### 2. Crear Login Page
**Archivo:** `app/(auth)/login/page.tsx`

```typescript
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center gap-3">
            <span className="text-6xl">🐦‍🔥</span>
          </div>
        </div>
        
        {/* Formulario */}
        <LoginForm />
        
        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          © 2026 OpsCore. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
```

### 3. Agregar Traducciones
**Archivos:**
- `i18n/messages/es.json`
- `i18n/messages/en.json`
- `i18n/messages/pt.json`

```json
{
  "auth": {
    "loginTitle": "Iniciar Sesión",
    "loginDescription": "Ingresa tus credenciales para continuar",
    "email": "Correo electrónico",
    "password": "Contraseña",
    "loginButton": "Ingresar",
    "loggingIn": "Ingresando..."
  }
}
```

### 4. Instalar Componentes shadcn/ui Necesarios
```bash
npx shadcn@latest add card
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add alert
```

### 5. Instalar Dependencias
```bash
npm install react-hook-form @hookform/resolvers zod
```

## ✅ Checklist
- [ ] Componente LoginForm creado
- [ ] Validación con Zod implementada
- [ ] Página de login con logo 🐦‍🔥
- [ ] Estados de loading funcionales
- [ ] Mensajes de error visibles
- [ ] Traducciones en es/en/pt
- [ ] Componentes shadcn/ui instalados
- [ ] Diseño responsivo
- [ ] Redirección al dashboard

## 🔗 Relacionado con
- Epic #X - Feature Login
- Module #X - Auth Store

## 🌿 Rama
`feature/login/ui`

---
**Estimación:** 1-2 días
