"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useIncidentsStore } from "@/features/incidents/stores/incidents-store";
import { CreateIncidentSheet } from "@/features/incidents/components/create-incident-sheet";
import { CreateUserSheet } from "@/features/users/components/create-user-sheet";
import { canCreateIncident, getRoleLabel, getRoleColor, type Role } from "@/lib/rbac";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Shield,
  Users,
  Plus,
  UserPlus,
  List,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { t, mounted } = useI18n();
  const { user } = useAuthStore();
  const {
    incidents,
    loading,
    fetchIncidents,
  } = useIncidentsStore();

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Sheet state for creating incident
  const [sheetOpen, setSheetOpen] = useState(false);
  const [userSheetOpen, setUserSheetOpen] = useState(false);

  const role = user?.role as Role | undefined;
  const allowCreateIncident = canCreateIncident(role);
  const roleLabel = role ? getRoleLabel(role, "es") : "";
  const roleColor = role ? getRoleColor(role) : "";

  const isTechnician = user?.role === "TECHNICIAN";
  const isOperator = user?.role === "OPERATOR";
  const visibleIncidents = isTechnician
      ? incidents.filter((i) => i.assignedToId === user?.id)
      : isOperator
        ? incidents.filter((i) => i.reportedById === user?.id)
        : incidents;

  // Calculate stats from filtered incidents
  const total = visibleIncidents.length;
  const open = visibleIncidents.filter((i) => i.status === "OPEN" || i.status === "ASSIGNED").length;
  const inProgress = visibleIncidents.filter((i) => i.status === "IN_PROGRESS").length;
  const closed = visibleIncidents.filter((i) => i.status === "CLOSED" || i.status === "RESOLVED" || i.status === "CANCELED").length;
  const byCategory = visibleIncidents.reduce<Record<string, number>>((acc, i) => {
    acc[i.type] = (acc[i.type] || 0) + 1;
    return acc;
  }, {});
  const resolvedList = visibleIncidents.filter((i) => i.status === "RESOLVED" || i.status === "CLOSED");
  const avgResolutionTime = resolvedList.length > 0
    ? resolvedList.reduce((acc, i) => {
        const created = new Date(i.createdAt).getTime();
        const updated = new Date(i.updatedAt).getTime();
        return acc + (updated - created) / 60000;
      }, 0) / resolvedList.length
    : 0;

  const recentIncidents = [...visibleIncidents]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const statCards = [
    {
      key: "total",
      label: "dashboard.incidentsTotal",
      value: total,
      icon: BarChart3,
      color: "text-primary",
      bg: "bg-primary/10",
      change: "",
      trend: "neutral" as const,
    },
    {
      key: "open",
      label: "dashboard.incidentsOpen",
      value: open,
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      change:
        open > 0
          ? t("dashboard.requiresAttention")
          : t("dashboard.allGood"),
      trend: open > 0 ? "down" : "up" as const,
    },
    {
      key: "inProgress",
      label: "dashboard.incidentsInProgress",
      value: inProgress,
      icon: Clock,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
      change: t("dashboard.inResolution"),
      trend: "up" as const,
    },
    {
      key: "closed",
      label: "dashboard.incidentsResolved",
      value: closed,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      change:
        total > 0
          ? `${((closed / total) * 100).toFixed(1)}% ${t("dashboard.resolved")}`
          : "0%",
      trend: "up" as const,
    },
  ];

  // ── Role-based actions ──────────────────────
  const getRoleActions = (r: Role | undefined) => {
    switch (r) {
      case "ADMIN":
        return [
          { icon: Shield, label: "dashboard.manageUsers", color: "text-destructive" },
          { icon: Users, label: "nav.usuarios", color: "text-primary" },
          { icon: List, label: "nav.incidentes", color: "text-chart-3" },
          { icon: BarChart3, label: "nav.reportes", color: "text-primary" },
        ];
      case "MANAGER":
        return [
          { icon: BarChart3, label: "dashboard.viewReports", color: "text-chart-4" },
          { icon: List, label: "nav.incidentes", color: "text-chart-3" },
          { icon: List, label: "nav.reportes", color: "text-primary" },
        ];
      case "SUPERVISOR":
        return [
          { icon: List, label: "nav.incidentes", color: "text-chart-3" },
          { icon: BarChart3, label: "nav.reportes", color: "text-primary" },
        ];
      case "TECHNICIAN":
        return [
          { icon: CheckCircle2, label: "dashboard.resolveIncident", color: "text-chart-3" },
          { icon: List, label: "nav.incidentes", color: "text-primary" },
        ];
      case "OPERATOR":
        return [
          { icon: AlertTriangle, label: "dashboard.reportIncident", color: "text-destructive" },
          { icon: List, label: "dashboard.myIncidents", color: "text-primary" },
        ];
      default:
        return [];
    }
  };

  const roleActions = getRoleActions(role);

  if (!mounted) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {mounted
                ? t("dashboard.welcome", { name: user?.firstName || "" })
                : "Dashboard"}
            </h1>
            <Badge variant="outline" className={cn("text-xs font-medium", roleColor)}>
              {roleLabel}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {allowCreateIncident && (
            <Button size="sm" onClick={() => setSheetOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              {t("dashboard.createIncident")}
            </Button>
          )}
          {role === "ADMIN" && (
            <Button size="sm" variant="outline" onClick={() => setUserSheetOpen(true)}>
              <UserPlus className="mr-1.5 h-4 w-4" />
              {t("users.form.submit")}
            </Button>
          )}
          {(role === "ADMIN" || role === "MANAGER" || role === "SUPERVISOR") && (
            <Link href="/dashboard/canvas">
              <Button variant="outline" size="sm">
                <BarChart3 className="mr-1.5 h-4 w-4" />
                {t("dashboard.viewReports")}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {mounted ? t(stat.label) : stat.label}
                  </p>
                  {loading ? (
                    <Skeleton className="mt-2 h-8 w-16" />
                  ) : (
                    <p className="mt-1 text-3xl font-bold text-card-foreground">
                      {stat.value}
                    </p>
                  )}
                </div>
                <div className={cn("rounded-lg p-2.5", stat.bg)}>
                  <Icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </div>
              {stat.change && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  ) : stat.trend === "down" ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-chart-3" />
                  ) : null}
                  <span>{stat.change}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Role-based Quick Actions */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 via-chart-3/5 to-primary/5 p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Shield className="h-4 w-4 text-primary" />
          {t("dashboard.rolePermissions")} {roleLabel}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {roleActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.label}
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-3"
              >
                <div className={cn("rounded-lg bg-background p-2", action.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-card-foreground">
                  {mounted ? t(action.label) : action.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-column: Recent Incidents + Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Incidents */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-sm font-semibold text-foreground">
              {t("dashboard.recentIncidents")}
            </h2>
            <Link href="/dashboard/incidentes">
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                {t("dashboard.viewAll")}
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentIncidents.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <AlertTriangle className="h-10 w-10 opacity-40" />
                <p className="text-sm">{t("dashboard.noIncidents")}</p>
              </div>
            ) : (
              recentIncidents.map((incident) => {
                const StatusIcon = getStatusIcon(incident.status);
                const statusColor = getStatusColor(incident.status);
                return (
                  <div
                    key={incident.id}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className={cn("rounded-lg p-2", statusColor.bg)}>
                      <StatusIcon className={cn("h-4 w-4", statusColor.text)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-card-foreground">
                        {incident.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {incident.areaName
                          ? `${getTypeLabel(t, incident.type)} · ${incident.areaName}`
                          : getTypeLabel(t, incident.type)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge
                        variant="outline"
                        className="text-xs font-medium"
                      >
                        {incident.priority}
                      </Badge>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Summary by Type */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-4">
            <h2 className="text-sm font-semibold text-foreground">
              {t("dashboard.summaryByType")}
            </h2>
          </div>
          <div className="space-y-4 p-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
              ) : Object.keys(byCategory).length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <BarChart3 className="h-10 w-10 opacity-40" />
                <p className="text-sm">{t("dashboard.noIncidents")}</p>
              </div>
            ) : (
              Object.entries(sortByValue(byCategory)).map(
                ([type, count]) => {
                  const percentage =
                    total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={type} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-card-foreground">
                          {mounted
                            ? t(`incidents.type.${type}`)
                            : type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                },
              )
            )}
          </div>
        </div>
      </div>

      {/* Average Resolution Time */}
      {avgResolutionTime > 0 && (
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/10 via-chart-3/10 to-chart-4/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t("dashboard.avgResolutionTime")}
              </h3>
              <p className="mt-1 text-3xl font-bold text-primary">
                {Math.floor(avgResolutionTime / 60)}h{" "}
                {Math.floor(avgResolutionTime % 60)}m
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("dashboard.basedOn")} {closed}{" "}
                {t("dashboard.closedIncidents")}
              </p>
            </div>
            <TrendingUp className="h-16 w-16 text-primary/20" />
          </div>
        </div>
      )}

      {/* Create Incident Sheet — OPERATOR only */}
      {allowCreateIncident && (
        <CreateIncidentSheet open={sheetOpen} onOpenChange={setSheetOpen} />
      )}
      {/* Create User Sheet — ADMIN only */}
      {role === "ADMIN" && (
        <CreateUserSheet open={userSheetOpen} onOpenChange={setUserSheetOpen} />
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────

function getStatusIcon(status: string) {
  switch (status) {
    case "OPEN":
      return AlertTriangle;
    case "IN_PROGRESS":
      return Clock;
    case "RESOLVED":
    case "CLOSED":
      return CheckCircle2;
    default:
      return AlertTriangle;
  }
}

function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case "OPEN":
      return { bg: "bg-destructive/10", text: "text-destructive" };
    case "IN_PROGRESS":
      return { bg: "bg-chart-3/10", text: "text-chart-3" };
    case "RESOLVED":
    case "CLOSED":
      return { bg: "bg-emerald-500/10", text: "text-emerald-500" };
    default:
      return { bg: "bg-muted", text: "text-muted-foreground" };
  }
}

function getTypeLabel(t: (key: string) => string, type: string): string {
  const key = `incidents.type.${type}`;
  const label = t(key);
  return label !== key ? label : type;
}

function sortByValue(obj: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(obj).sort(([, a], [, b]) => b - a),
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
