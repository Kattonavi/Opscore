import { Role } from "@/api/types";

// Definición de items de navegación por rol
export interface NavItem {
  href: string;
  icon: string; // Nombre del icono de Lucide
  key: string;
  label: string;
  roles: Role[];
}

export const navItems: NavItem[] = [
  {
    href: "/dashboard",
    icon: "LayoutDashboard",
    key: "dashboard",
    label: "Dashboard",
    roles: [Role.ADMIN, Role.MANAGER, Role.SUPERVISOR, Role.TECHNICIAN, Role.OPERATOR],
  },
  {
    href: "/dashboard/incidentes",
    icon: "AlertTriangle",
    key: "incidentes",
    label: "nav.incidentes",
    roles: [Role.ADMIN, Role.MANAGER, Role.SUPERVISOR, Role.TECHNICIAN, Role.OPERATOR],
  },
  {
    href: "/dashboard/canvas",
    icon: "BarChart3",
    key: "reportes",
    label: "nav.reportes",
    roles: [Role.ADMIN, Role.MANAGER, Role.SUPERVISOR],
  },
  {
    href: "/dashboard/usuarios",
    icon: "Users",
    key: "usuarios",
    label: "nav.usuarios",
    roles: [Role.ADMIN, Role.MANAGER],
  },
  {
    href: "/dashboard/asignaciones",
    icon: "UserCheck",
    key: "asignaciones",
    label: "nav.asignaciones",
    roles: [Role.ADMIN, Role.MANAGER, Role.SUPERVISOR],
  },
  {
    href: "/dashboard/perfil",
    icon: "UserCircle",
    key: "perfil",
    label: "nav.perfil",
    roles: [Role.ADMIN, Role.MANAGER, Role.SUPERVISOR, Role.TECHNICIAN, Role.OPERATOR],
  },
  {
    href: "/dashboard/configuracion",
    icon: "Settings",
    key: "configuracion",
    label: "nav.configuracion",
    roles: [Role.ADMIN, Role.MANAGER, Role.SUPERVISOR, Role.TECHNICIAN, Role.OPERATOR],
  },
];

// Filtrar navegación según rol
export const getNavItemsByRole = (role: Role | null | undefined): NavItem[] => {
  if (!role) return [];
  return navItems.filter((item) => item.roles.includes(role));
};

// Verificar si un rol tiene acceso a una ruta
export const hasRouteAccess = (
  pathname: string,
  role: Role | null | undefined
): boolean => {
  if (!role) return false;
  
  // Normalizar pathname (remover parámetros de query)
  const cleanPath = pathname.split("?")[0];
  
  const navItem = navItems.find((item) => 
    cleanPath === item.href || cleanPath.startsWith(item.href + "/")
  );
  
  if (!navItem) return true; // Si no está en la lista, permitir por defecto
  
  return navItem.roles.includes(role);
};

// Verificar permisos específicos
export const canCreateIncident = (role: Role | null | undefined): boolean => {
  if (!role) return false;
  return [Role.ADMIN, Role.MANAGER, Role.SUPERVISOR, Role.OPERATOR].includes(role);
};

export const canAssignIncident = (role: Role | null | undefined): boolean => {
  if (!role) return false;
  return [Role.ADMIN, Role.MANAGER, Role.SUPERVISOR].includes(role);
};

export const canResolveIncident = (role: Role | null | undefined): boolean => {
  if (!role) return false;
  return [Role.ADMIN, Role.TECHNICIAN].includes(role);
};

export const canManageUsers = (role: Role | null | undefined): boolean => {
  if (!role) return false;
  return [Role.ADMIN, Role.MANAGER].includes(role);
};

export const canViewReports = (role: Role | null | undefined): boolean => {
  if (!role) return false;
  return [Role.ADMIN, Role.MANAGER, Role.SUPERVISOR].includes(role);
};

// Mapa de traducciones de roles
const roleLabels: Record<string, Record<string, string>> = {
  es: {
    [Role.ADMIN]: "Administrador",
    [Role.MANAGER]: "Manager",
    [Role.SUPERVISOR]: "Supervisor",
    [Role.TECHNICIAN]: "Técnico",
    [Role.OPERATOR]: "Operador",
  },
  en: {
    [Role.ADMIN]: "Administrator",
    [Role.MANAGER]: "Manager",
    [Role.SUPERVISOR]: "Supervisor",
    [Role.TECHNICIAN]: "Technician",
    [Role.OPERATOR]: "Operator",
  },
  pt: {
    [Role.ADMIN]: "Administrador",
    [Role.MANAGER]: "Gerente",
    [Role.SUPERVISOR]: "Supervisor",
    [Role.TECHNICIAN]: "Técnico",
    [Role.OPERATOR]: "Operador",
  },
};

// Obtener label del rol según idioma
export const getRoleLabel = (role: Role | string | null | undefined, language: string = "es"): string => {
  if (!role) return language === "es" ? "Invitado" : language === "en" ? "Guest" : "Convidado";
  return roleLabels[language]?.[role] || roleLabels["es"][role] || role;
};

// Obtener color del rol (usando variables del tema)
export const getRoleColor = (role: Role | string | null | undefined): string => {
  switch (role) {
    case Role.ADMIN:
      return "bg-destructive/10 text-destructive border-destructive/20";
    case Role.MANAGER:
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case Role.SUPERVISOR:
      return "bg-primary/10 text-primary border-primary/20";
    case Role.TECHNICIAN:
      return "bg-accent/10 text-accent border-accent/20";
    case Role.OPERATOR:
      return "bg-muted text-muted-foreground border-muted-foreground/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};
