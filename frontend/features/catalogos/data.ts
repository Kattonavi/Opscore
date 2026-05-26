import {
  IncidentType,
  Priority,
  Category,
  IncidentAction,
  incidentTypeConfig,
  priorityConfig,
  categoryConfig,
  incidentActionConfig,
} from "@/api/incidents/types";
import {
  Wrench,
  ShieldAlert,
  Network,
  Monitor,
  Bug,
  Lock,
  KeyRound,
  Ellipsis,
  Gauge,
  AlertTriangle,
  Target,
  Cpu,
  PlusCircle,
  UserCheck,
  UserCog,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Types ──────────────────────────────────────

export interface CatalogItem<T extends string> {
  value: T;
  icon: LucideIcon;
  labelKey: string;
  color: string;
}

export interface CatalogSection<T extends string> {
  key: string;
  tabKey: string;
  values: T[];
  getItem: (v: T) => CatalogItem<T>;
}

// ── IncidentType ────────────────────────────────

const typeIcons: Record<IncidentType, LucideIcon> = {
  [IncidentType.MACHINE_FAILURE]: Wrench,
  [IncidentType.QUALITY_ISSUE]: Target,
  [IncidentType.ACCIDENT]: ShieldAlert,
  [IncidentType.NETWORK]: Network,
  [IncidentType.HARDWARE]: Monitor,
  [IncidentType.SOFTWARE]: Bug,
  [IncidentType.SECURITY]: Lock,
  [IncidentType.ACCESS]: KeyRound,
  [IncidentType.OTHER]: Ellipsis,
};

function getTypeItem(v: IncidentType): CatalogItem<IncidentType> {
  return {
    value: v,
    icon: typeIcons[v],
    labelKey: `incidents.type.${v}`,
    color: incidentTypeConfig[v].color,
  };
}

// ── Priority ────────────────────────────────────

const priorityIcons: Record<Priority, LucideIcon> = {
  [Priority.LOW]: Gauge,
  [Priority.MEDIUM]: AlertTriangle,
  [Priority.HIGH]: AlertTriangle,
  [Priority.CRITICAL]: AlertTriangle,
};

function getPriorityItem(v: Priority): CatalogItem<Priority> {
  return {
    value: v,
    icon: priorityIcons[v],
    labelKey: `catalogosPage.priority.${v}`,
    color: priorityConfig[v].color,
  };
}

// ── Category ────────────────────────────────────

const categoryIcons: Record<Category, LucideIcon> = {
  [Category.SAFETY]: ShieldAlert,
  [Category.QUALITY]: Target,
  [Category.OPERATIONS]: Cpu,
  [Category.MAINTENANCE]: Wrench,
  [Category.OTHER]: Ellipsis,
};

function getCategoryItem(v: Category): CatalogItem<Category> {
  return {
    value: v,
    icon: categoryIcons[v],
    labelKey: `catalogosPage.category.${v}`,
    color: categoryConfig[v].color,
  };
}

// ── IncidentAction ──────────────────────────────

const actionIcons: Record<IncidentAction, LucideIcon> = {
  [IncidentAction.INCIDENT_CREATED]: PlusCircle,
  [IncidentAction.ASSIGNED]: UserCheck,
  [IncidentAction.REASSIGNED]: UserCog,
  [IncidentAction.STARTED]: Play,
  [IncidentAction.PUT_ON_HOLD]: Pause,
  [IncidentAction.RESOLVED]: CheckCircle,
  [IncidentAction.CLOSED]: CheckCircle,
  [IncidentAction.CANCELED]: XCircle,
  [IncidentAction.COMMENT_ADDED]: MessageSquare,
};

function getActionItem(v: IncidentAction): CatalogItem<IncidentAction> {
  return {
    value: v,
    icon: actionIcons[v],
    labelKey: `catalogosPage.action.${v}`,
    color: incidentActionConfig[v].color,
  };
}

// ── Sections ────────────────────────────────────

// `any` here is intentional: each section uses a different enum (IncidentType,
// Priority, Category, IncidentAction) and the discriminated union would be
// invariant in `getItem`, breaking callers that iterate over `section.values`
// and pass each value to `section.getItem(v)`. The runtime contract is safe
// because every section pairs its own `values` with the matching `getItem`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CATALOG_SECTIONS: CatalogSection<any>[] = [
  {
    key: "types",
    tabKey: "catalogosPage.tabs.types",
    values: Object.values(IncidentType),
    getItem: getTypeItem,
  },
  {
    key: "priorities",
    tabKey: "catalogosPage.tabs.priorities",
    values: Object.values(Priority),
    getItem: getPriorityItem,
  },
  {
    key: "categories",
    tabKey: "catalogosPage.tabs.categories",
    values: Object.values(Category),
    getItem: getCategoryItem,
  },
  {
    key: "actions",
    tabKey: "catalogosPage.tabs.actions",
    values: Object.values(IncidentAction),
    getItem: getActionItem,
  },
];
