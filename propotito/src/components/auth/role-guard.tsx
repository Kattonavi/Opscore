"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { Role } from "@/api/types";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Role[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, isAuthenticated, loading } = useAuthStore();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const hasRole = user && allowedRoles.includes(user.role as Role);

  if (!hasRole) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
        <p className="text-muted-foreground text-center max-w-md">
          No tienes permisos para acceder a esta sección. Contacta a un administrador si crees que esto es un error.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
