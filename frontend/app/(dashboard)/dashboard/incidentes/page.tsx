"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useIncidentsStore } from "@/features/incidents/stores/incidents-store";
import { CreateIncidentSheet } from "@/features/incidents/components/create-incident-sheet";
import type { IncidentResponseDTO } from "@/api/incidents/types";
import { canCreateIncident } from "@/lib/rbac";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  BarChart3,
  AlertCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const priorityConfig: Record<string, { color: string; badge: string }> = {
  LOW: { color: "bg-blue-50 dark:bg-blue-950", badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  MEDIUM: { color: "bg-yellow-50 dark:bg-yellow-950", badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  HIGH: { color: "bg-orange-50 dark:bg-orange-950", badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  CRITICAL: { color: "bg-red-50 dark:bg-red-950", badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

export default function IncidentsPage() {
  const { t, mounted } = useI18n();
  const { user } = useAuthStore();
  const {
    incidents,
    loading,
    fetchIncidents,
  } = useIncidentsStore();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const isTechnician = user?.role === "TECHNICIAN";
  const isOperator = user?.role === "OPERATOR";
  // Business rule #1 — only OPERATOR can create incidents; the button must
  // be hidden for every other role (the backend rejects them with 403).
  const allowCreate = canCreateIncident(user?.role);
  const visibleIncidents = isTechnician
      ? incidents.filter((i) => i.assignedToId === user?.id)
      : isOperator
        ? incidents.filter((i) => i.reportedById === user?.id)
        : incidents;

  const stats = visibleIncidents.reduce(
    (acc, inc) => {
      acc.total++;
      if (inc.status === "OPEN") acc.open++;
      if (inc.status === "ASSIGNED") acc.assigned++;
      if (inc.status === "IN_PROGRESS") acc.inProgress++;
      if (inc.status === "ON_HOLD") acc.onHold++;
      if (inc.status === "RESOLVED") acc.resolved++;
      if (inc.status === "CLOSED" || inc.status === "CANCELED") acc.closed++;
      return acc;
    },
    { total: 0, open: 0, assigned: 0, inProgress: 0, onHold: 0, resolved: 0, closed: 0 },
  );

  // NOTE: el botón "Seed test data" se removió del frontend productivo.
  // Bajo la nueva regla #1 sólo OPERATOR puede crear incidentes, por lo que
  // sembrar datos desde un ADMIN ya no es viable. Si se necesita seed,
  // moverlo a una herramienta de desarrollo (script `qa/`) o a un endpoint
  // dev-only protegido en el backend.

  const handleOpenSheet = () => {
    setSheetOpen(true);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("nav.incidentes")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.incidentsTotal")}: {stats.total}
          </p>
        </div>
        <div className="flex gap-2">
          {allowCreate && (
            <Button onClick={handleOpenSheet}>
              <Plus className="mr-1.5 h-4 w-4" />
              {t("dashboard.createIncident")}
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          {
            key: "total",
            label: "dashboard.incidentsTotal",
            value: stats.total,
            icon: BarChart3,
            color: "text-primary",
            border: "border-l-primary",
          },
          {
            key: "open",
            label: "incidents.tabs.open",
            value: stats.open,
            icon: AlertTriangle,
            color: "text-destructive",
            border: "border-l-destructive",
          },
          {
            key: "assigned",
            label: "incidents.tabs.assigned",
            value: stats.assigned,
            icon: User,
            color: "text-purple-500",
            border: "border-l-purple-500",
          },
          {
            key: "inProgress",
            label: "dashboard.incidentsInProgress",
            value: stats.inProgress,
            icon: Clock,
            color: "text-chart-3",
            border: "border-l-chart-3",
          },
          {
            key: "closed",
            label: "dashboard.incidentsResolved",
            value: stats.closed,
            icon: CheckCircle2,
            color: "text-emerald-500",
            border: "border-l-emerald-500",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.key} className={cn("border-l-4", stat.border)}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t(stat.label)}
                  </p>
                  {loading ? (
                    <Skeleton className="mt-1 h-7 w-12" />
                  ) : (
                    <p className="text-2xl font-bold text-card-foreground">
                      {stat.value}
                    </p>
                  )}
                </div>
                <div className={cn("rounded-lg p-2.5", `${stat.color.replace("text-", "bg-")}/10`)}>
                  <Icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Board — Trello-like columns */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
          {/* Columna: Abiertos */}
          <BoardColumn
            title={t("incidents.tabs.open")}
            count={visibleIncidents.filter((i) => i.status === "OPEN").length}
            incidents={visibleIncidents.filter((i) => i.status === "OPEN")}
            color="border-l-destructive"
            headerBg="bg-destructive/10"
            headerText="text-destructive"
          />
          {/* Columna: Asignados */}
          <BoardColumn
            title={t("incidents.tabs.assigned") || "Asignado"}
            count={visibleIncidents.filter((i) => i.status === "ASSIGNED").length}
            incidents={visibleIncidents.filter((i) => i.status === "ASSIGNED")}
            color="border-l-purple-500"
            headerBg="bg-purple-500/10"
            headerText="text-purple-500"
          />
          {/* Columna: En Progreso */}
          <BoardColumn
            title={t("incidents.tabs.inProgress")}
            count={stats.inProgress}
            incidents={visibleIncidents.filter((i) => i.status === "IN_PROGRESS")}
            color="border-l-chart-3"
            headerBg="bg-chart-3/10"
            headerText="text-chart-3"
          />
          {/* Columna: En Espera */}
          <BoardColumn
            title={t("incidents.tabs.onHold")}
            count={stats.onHold}
            incidents={visibleIncidents.filter((i) => i.status === "ON_HOLD")}
            color="border-l-amber-500"
            headerBg="bg-amber-500/10"
            headerText="text-amber-500"
          />
          {/* Columna: Resueltos */}
          <BoardColumn
            title={t("incidents.tabs.resolved")}
            count={stats.resolved}
            incidents={visibleIncidents.filter((i) => i.status === "RESOLVED")}
            color="border-l-emerald-500"
            headerBg="bg-emerald-500/10"
            headerText="text-emerald-500"
          />
          {/* Columna: Cerrados */}
          <BoardColumn
            title={t("incidents.tabs.closed")}
            count={visibleIncidents.filter((i) => i.status === "CLOSED").length}
            incidents={visibleIncidents.filter((i) => i.status === "CLOSED")}
            color="border-l-muted-foreground"
            headerBg="bg-muted"
            headerText="text-muted-foreground"
          />
          {/* Columna: Cancelados */}
          <BoardColumn
            title={t("incidents.tabs.canceled")}
            count={visibleIncidents.filter((i) => i.status === "CANCELED").length}
            incidents={visibleIncidents.filter((i) => i.status === "CANCELED")}
            color="border-l-slate-500"
            headerBg="bg-slate-500/10"
            headerText="text-slate-500"
          />
        </div>
      )}

      {/* ─── Create Incident Sheet ─── */}
      {allowCreate && (
        <CreateIncidentSheet open={sheetOpen} onOpenChange={setSheetOpen} />
      )}
    </div>
  );
}

// ── Board Column ────────────────────────────────

interface BoardColumnProps {
  title: string;
  count: number;
  incidents: IncidentResponseDTO[];
  color: string;
  headerBg: string;
  headerText: string;
}

function BoardColumn({ title, count, incidents, color, headerBg, headerText }: BoardColumnProps) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className={cn("flex flex-col rounded-lg border border-border", color)}>
      {/* Header */}
      <div className={cn("flex items-center justify-between rounded-t-lg px-3 py-2.5", headerBg)}>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-semibold", headerText)}>{title}</span>
          <span className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold", headerBg, headerText)}>
            {count}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 p-2">
        {incidents.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-muted-foreground">
            <AlertCircle className="mb-2 h-6 w-6 opacity-30" />
            <p className="text-xs">{t("dashboard.noIncidents")}</p>
          </div>
        ) : (
          incidents.map((incident) => {
            const priorityCfg = priorityConfig[incident.priority];
            return (
              <Card
                key={incident.id}
                className="cursor-pointer transition-colors hover:border-primary/50"
                onClick={() => router.push(`/dashboard/incidentes/${incident.id}`)}
              >
                <CardContent className="p-3">
                  <p className="truncate text-sm font-medium text-card-foreground">
                    {incident.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {incident.areaName || incident.type}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-block h-2 w-2 rounded-full",
                        priorityCfg?.color || "bg-muted",
                      )}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {incident.priority}
                    </span>
                    {incident.assignedToName && (
                      <>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <User className="inline h-2.5 w-2.5 text-muted-foreground" />
                        <span className="truncate text-[10px] text-muted-foreground">
                          {incident.assignedToName}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
