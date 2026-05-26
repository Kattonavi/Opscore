export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  SUPERVISOR = "SUPERVISOR",
  TECHNICIAN = "TECHNICIAN",
  OPERATOR = "OPERATOR",
}

export interface NavItem {
  href: string;
  icon: string;
  key: string;
  label: string;
  roles: Role[];
}

export interface MenuSection {
  key: string;
  label: string;
  items: string[];
}

export const MENU_SECTIONS: MenuSection[] = [
  { key: "sistema-gestion", label: "nav.sistemaGestion", items: ["dashboard", "incidentes", "reportes"] },
  { key: "personal", label: "nav.personal", items: ["perfil"] },
  { key: "configuracion", label: "nav.configuracionSection", items: ["usuarios", "roles", "areas", "estados", "catalogos", "configuracion"] },
];

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    icon: "LayoutDashboard",
    key: "dashboard",
    label: "nav.dashboard",
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
    href: "/dashboard/perfil",
    icon: "UserCircle",
    key: "perfil",
    label: "nav.perfil",
    roles: [Role.ADMIN, Role.MANAGER, Role.SUPERVISOR, Role.TECHNICIAN, Role.OPERATOR],
  },
  {
    href: "/dashboard/usuarios",
    icon: "Users",
    key: "usuarios",
    label: "nav.usuarios",
    roles: [Role.ADMIN, Role.MANAGER],
  },
  {
    href: "/dashboard/roles",
    icon: "Shield",
    key: "roles",
    label: "nav.roles",
    roles: [Role.ADMIN],
  },
  {
    href: "/dashboard/areas",
    icon: "Building2",
    key: "areas",
    label: "nav.areas",
    roles: [Role.ADMIN, Role.MANAGER],
  },
  {
    href: "/dashboard/estados",
    icon: "ListChecks",
    key: "estados",
    label: "nav.estados",
    roles: [Role.ADMIN, Role.MANAGER, Role.SUPERVISOR],
  },
  {
    href: "/dashboard/catalogos",
    icon: "BookOpen",
    key: "catalogos",
    label: "nav.catalogos",
    roles: [Role.ADMIN, Role.MANAGER, Role.SUPERVISOR],
  },
  {
    href: "/dashboard/configuracion",
    icon: "Settings",
    key: "configuracion",
    label: "nav.configuracion",
    roles: [Role.ADMIN, Role.MANAGER, Role.SUPERVISOR, Role.TECHNICIAN, Role.OPERATOR],
  },
];

export function getNavItemsByRole(role: Role | null | undefined): NavItem[] {
  if (!role) return [];
  return navItems.filter((item) => item.roles.includes(role));
}

export function hasRouteAccess(pathname: string, role: Role | null | undefined): boolean {
  if (!role) return false;
  const cleanPath = pathname.split("?")[0];
  const item = navItems.find((i) => cleanPath === i.href || cleanPath.startsWith(i.href + "/"));
  if (!item) return true;
  return item.roles.includes(role);
}

export function getNavItemsBySection(role: Role | null | undefined): { section: MenuSection; items: NavItem[] }[] {
  if (!role) return [];
  const allowed = getNavItemsByRole(role);
  return MENU_SECTIONS.map((section) => ({
    section,
    items: section.items
      .map((key) => allowed.find((i) => i.key === key))
      .filter((i): i is NavItem => i !== undefined),
  })).filter(({ items }) => items.length > 0);
}

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

export function getRoleLabel(role: Role | string | null | undefined, language: string = "es"): string {
  if (!role) return language === "es" ? "Invitado" : language === "en" ? "Guest" : "Convidado";
  return roleLabels[language]?.[role] || roleLabels["es"][role] || role;
}

export function getRoleColor(role: Role | string | null | undefined): string {
  switch (role) {
    case Role.ADMIN:
      return "bg-destructive/10 text-destructive";
    case Role.MANAGER:
      return "bg-purple-500/10 text-purple-500";
    case Role.SUPERVISOR:
      return "bg-primary/10 text-primary";
    case Role.TECHNICIAN:
      return "bg-amber-500/10 text-amber-500";
    case Role.OPERATOR:
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}
