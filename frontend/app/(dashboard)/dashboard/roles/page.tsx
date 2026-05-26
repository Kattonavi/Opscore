"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { getRoleColor, Role } from "@/lib/rbac";
import { Shield, Users, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RoleInfo {
  id: number;
  name: Role;
  description: string;
  usersCount: number;
  permissions: string[];
}

const ROLES_DATA: RoleInfo[] = [
  {
    id: 1,
    name: Role.ADMIN,
    description: "Acceso completo al sistema. Gestión de usuarios, roles, y configuración general.",
    usersCount: 2,
    permissions: ["permDashboard", "permIncidents", "permAssign", "permUsers", "permRoles", "permSettings"],
  },
  {
    id: 2,
    name: Role.MANAGER,
    description: "Visión gerencial del sistema. Acceso a reportes, dashboard y gestión de incidentes.",
    usersCount: 3,
    permissions: ["permDashboard", "permIncidents", "permAssign", "permSettings"],
  },
  {
    id: 3,
    name: Role.SUPERVISOR,
    description: "Supervisión de operaciones. Puede asignar técnicos y gestionar incidentes.",
    usersCount: 4,
    permissions: ["permDashboard", "permIncidents", "permAssign"],
  },
  {
    id: 4,
    name: Role.TECHNICIAN,
    description: "Resolución de incidentes asignados. Puede iniciar, pausar y resolver incidentes.",
    usersCount: 8,
    permissions: ["permDashboard", "permIncidents"],
  },
  {
    id: 5,
    name: Role.OPERATOR,
    description: "Reporte de incidentes. Puede crear y dar seguimiento a sus reportes.",
    usersCount: 12,
    permissions: ["permDashboard", "permIncidents"],
  },
];

const PERM_LABELS: Record<string, string> = {
  permDashboard: "permDashboard",
  permIncidents: "permIncidents",
  permAssign: "permAssign",
  permUsers: "permUsers",
  permRoles: "permRoles",
  permSettings: "permSettings",
};

export default function RolesPage() {
  const { t, mounted } = useI18n();

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("rolesPage.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("rolesPage.subtitle")}
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {ROLES_DATA.map((roleInfo) => {
          const colorClass = getRoleColor(roleInfo.name);
          return (
            <Card
              key={roleInfo.id}
              className="transition-colors hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("rounded-lg p-2.5", colorClass.replace("text-", "bg-").replace("text-", "bg-").split(" ")[0] + "/10")}>
                      <Shield className={cn("h-5 w-5", colorClass.split(" ")[0])} />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {roleInfo.name === Role.ADMIN && "Administrador"}
                        {roleInfo.name === Role.MANAGER && "Manager"}
                        {roleInfo.name === Role.SUPERVISOR && "Supervisor"}
                        {roleInfo.name === Role.TECHNICIAN && "Técnico"}
                        {roleInfo.name === Role.OPERATOR && "Operador"}
                      </CardTitle>
                      <Badge variant="outline" className={cn("mt-0.5 text-xs", colorClass)}>
                        {roleInfo.name}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    <Users className="mr-1 h-3 w-3" />
                    {roleInfo.usersCount}
                  </Badge>
                </div>
                <CardDescription className="mt-3 text-sm">
                  {roleInfo.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("rolesPage.permissions")}
                </h4>
                <div className="space-y-1.5">
                  {roleInfo.permissions.map((perm) => (
                    <div key={perm} className="flex items-center gap-2 text-sm">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span className="text-muted-foreground">
                        {t(`rolesPage.${perm}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
