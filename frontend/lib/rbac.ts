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

// ──────────────────────────────────────────────────────────────────
// Incident RBAC helpers
//
// These helpers mirror the rules enforced by the backend
// (`IncidentAccessService` + controller `@PreAuthorize`).
// Keep them as the single source of truth for *visual* permission
// checks in the UI; do not duplicate role/status comparisons in
// page components.
// ──────────────────────────────────────────────────────────────────

/** Incident lifecycle states, mirrored from `@/api/incidents/types`. */
export type IncidentStatusName =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELED";

/** Minimal user shape required by the helpers (id + role). */
export interface RbacUser {
  id: number;
  role: Role | string;
}

/** Minimal incident shape required by the helpers. `assignedToId` is the
 *  authoritative field on `IncidentResponseDTO`. */
export interface RbacIncident {
  assignedToId?: number | null;
}

/** ADMIN / MANAGER / SUPERVISOR — the roles authorised to manage the
 *  lifecycle of an incident from a "managerial" perspective. */
export function isIncidentManagerRole(
  role: Role | string | null | undefined,
): boolean {
  return (
    role === Role.ADMIN ||
    role === Role.MANAGER ||
    role === Role.SUPERVISOR
  );
}

/** True when the current TECHNICIAN user is the one assigned to the
 *  incident. Returns false for any other role or when either side is
 *  missing the id. */
export function isAssignedTechnician(
  user: RbacUser | null | undefined,
  incident: RbacIncident | null | undefined,
): boolean {
  if (!user || !incident) return false;
  if (user.role !== Role.TECHNICIAN) return false;
  return (
    typeof incident.assignedToId === "number" &&
    incident.assignedToId === user.id
  );
}

// ── Per-action helpers ────────────────────────────────────────────

/** Assign / Reassign: managers, while the incident is still actionable. */
export function canAssignIncident(
  role: Role | string | null | undefined,
  status: IncidentStatusName | string | null | undefined,
): boolean {
  if (!isIncidentManagerRole(role)) return false;
  return status !== "CLOSED" && status !== "CANCELED";
}

/** Cancel: managers, until the incident is resolved/closed/already cancelled. */
export function canCancelIncident(
  role: Role | string | null | undefined,
  status: IncidentStatusName | string | null | undefined,
): boolean {
  if (!isIncidentManagerRole(role)) return false;
  return (
    status !== "CLOSED" &&
    status !== "RESOLVED" &&
    status !== "CANCELED"
  );
}

/** Close (RESOLVED → CLOSED): managers only. */
export function canCloseIncident(
  role: Role | string | null | undefined,
  status: IncidentStatusName | string | null | undefined,
): boolean {
  if (!isIncidentManagerRole(role)) return false;
  return status === "RESOLVED";
}

/** Start (ASSIGNED / ON_HOLD → IN_PROGRESS): only the assigned technician. */
export function canStartIncident(
  role: Role | string | null | undefined,
  status: IncidentStatusName | string | null | undefined,
  isAssigned: boolean,
): boolean {
  if (role !== Role.TECHNICIAN || !isAssigned) return false;
  return status === "ASSIGNED" || status === "ON_HOLD";
}

/** Hold (IN_PROGRESS → ON_HOLD): only the assigned technician. */
export function canHoldIncident(
  role: Role | string | null | undefined,
  status: IncidentStatusName | string | null | undefined,
  isAssigned: boolean,
): boolean {
  if (role !== Role.TECHNICIAN || !isAssigned) return false;
  return status === "IN_PROGRESS";
}

/** Resolve (IN_PROGRESS → RESOLVED): only the assigned technician. */
export function canResolveIncident(
  role: Role | string | null | undefined,
  status: IncidentStatusName | string | null | undefined,
  isAssigned: boolean,
): boolean {
  if (role !== Role.TECHNICIAN || !isAssigned) return false;
  return status === "IN_PROGRESS";
}

/** Should the "Assignments" tab be visible to this role at all?
 *  OPERATOR has no business managing assignments. */
export function canViewAssignmentsTab(
  role: Role | string | null | undefined,
): boolean {
  return role !== Role.OPERATOR;
}
