"use client";

import { useEffect, useMemo } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useIncidentsStore } from "@/features/incidents/stores/incidents-store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Activity,
  PieChart as PieChartIcon,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// ── Color palette (matches Tailwind chart colors visually) ───────────

const STATUS_COLORS: Record<string, string> = {
  open: "#EF4444",
  assigned: "#F59E0B",
  inProgress: "#3B82F6",
  onHold: "#8B5CF6",
  resolved: "#10B981",
  closed: "#6B7280",
  canceled: "#9CA3AF",
};

const CHART_PALETTE = [
  "#6366F1", // indigo
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
  "#84CC16", // lime
  "#06B6D4", // cyan
  "#A855F7", // purple
  "#E11D48", // rose
];

const PRIORITY_COLORS: Record<string, string> = {
  low: "#84CC16",
  medium: "#F59E0B",
  high: "#F97316",
  critical: "#EF4444",
};

// ── Helpers ───────────────────────────────────

function formatStatusLabel(key: string): string {
  const map: Record<string, string> = {
    open: "Abierto",
    assigned: "Asignado",
    inProgress: "En Progreso",
    onHold: "En Espera",
    resolved: "Resuelto",
    closed: "Cerrado",
    canceled: "Cancelado",
    low: "Baja",
    medium: "Media",
    high: "Alta",
    critical: "Crítica",
  };
  return map[key] || key;
}

function toPascalCase(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

// ── Tooltip (must be a component, not a function) ────

interface ChartTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color?: string }[];
  label?: string;
  formatter?: (value: number) => string;
}

function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium text-card-foreground">{label || toPascalCase(payload[0]?.name || "")}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-muted-foreground">
          <span
            className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color || CHART_PALETTE[i] }}
          />
          {entry.name}: <span className="font-medium text-card-foreground">{formatter ? formatter(entry.value) : entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Custom Active Dot ─────────────────────────

function CustomDot({ cx, cy, fill }: { cx?: number; cy?: number; fill?: string }) {
  if (cx == null || cy == null) return null;
  return (
    <circle cx={cx} cy={cy} r={5} fill={fill || "#6366F1"} stroke="white" strokeWidth={2} />
  );
}

// ── Page ──────────────────────────────────────

export default function CanvasPage() {
  const { t, mounted } = useI18n();
  const { user } = useAuthStore();
  const { incidents, loading, fetchIncidents } = useIncidentsStore();

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Role-based filter (same as incidents page + resumen)
  const visibleIncidents = useMemo(() => {
    const isSupervisor = user?.role === "SUPERVISOR";
    const isTechnician = user?.role === "TECHNICIAN";
    const isOperator = user?.role === "OPERATOR";
    if (isSupervisor) return incidents.filter((i) => i.areaName === user?.area);
    if (isTechnician) return incidents.filter((i) => i.assignedToId === user?.id);
    if (isOperator) return incidents.filter((i) => i.reportedById === user?.id);
    return incidents;
  }, [incidents, user]);

  // ── Compute derived stats from filtered incidents ──

  const totalIncidents = visibleIncidents.length;
  const openCount = visibleIncidents.filter((i) => i.status === "OPEN" || i.status === "ASSIGNED").length;
  const inProgressCount = visibleIncidents.filter((i) => i.status === "IN_PROGRESS" || i.status === "ON_HOLD").length;
  const resolvedCount = visibleIncidents.filter((i) => i.status === "RESOLVED" || i.status === "CLOSED" || i.status === "CANCELED").length;
  const resolutionRate = totalIncidents > 0 ? ((resolvedCount / totalIncidents) * 100).toFixed(1) : "0.0";

  // ── Compute status counts per key ──
  const statusCounts: Record<string, number> = {};
  for (const i of visibleIncidents) {
    const key = i.status.toLowerCase();
    statusCounts[key] = (statusCounts[key] || 0) + 1;
  }

  // ── Compute priority counts per key ──
  const priorityCounts: Record<string, number> = {};
  for (const i of visibleIncidents) {
    const key = i.priority.toLowerCase();
    priorityCounts[key] = (priorityCounts[key] || 0) + 1;
  }

  // ── Prepare chart data ──

  const statusChartData = visibleIncidents.length > 0
    ? Object.entries(statusCounts).map(([key, value]) => ({
        name: formatStatusLabel(key),
        key,
        value,
        fill: STATUS_COLORS[key] || CHART_PALETTE[0],
      }))
    : [];

  const priorityChartData = visibleIncidents.length > 0
    ? Object.entries(priorityCounts).map(([key, value]) => ({
        name: formatStatusLabel(key),
        key,
        value,
        fill: PRIORITY_COLORS[key] || CHART_PALETTE[0],
      }))
    : [];

  // ── Area counts from filtered incidents ──
  const areaCounts: Record<string, number> = {};
  for (const i of visibleIncidents) {
    const area = i.areaName || "Sin área";
    areaCounts[area] = (areaCounts[area] || 0) + 1;
  }

  const areaChartData = Object.entries(areaCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));

  const isAreaEmpty = areaChartData.length === 0;

  // ── Render ──

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("nav.reportes")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.description")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchIncidents()} disabled={loading}>
          <RefreshCw className={cn("mr-1.5 h-4 w-4", loading && "animate-spin")} />
          {t("reports.refresh") || "Actualizar"}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={BarChart3}
          label={t("dashboard.incidentsTotal") || "Total"}
          value={totalIncidents}
          loading={loading}
          color="text-primary"
          bg="bg-primary/10"
        />
        <KpiCard
          icon={AlertTriangle}
          label={t("dashboard.incidentsOpen") || "Abiertos"}
          value={openCount}
          loading={loading}
          color="text-destructive"
          bg="bg-destructive/10"
        />
        <KpiCard
          icon={Clock}
          label={t("dashboard.incidentsInProgress") || "En Progreso"}
          value={inProgressCount}
          loading={loading}
          color="text-chart-3"
          bg="bg-chart-3/10"
        />
        <KpiCard
          icon={CheckCircle2}
          label={t("dashboard.resolutionRate") || "Tasa de Resolución"}
          value={`${resolutionRate}%`}
          loading={loading}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm">{t("reports.statusDistribution") || "Distribución por Estado"}</CardTitle>
                <CardDescription>{t("reports.statusDesc") || "Incidentes agrupados por estado actual"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px] w-full rounded-lg" />
            ) : statusChartData.length === 0 ? (
              <EmptyChart state="No hay incidentes registrados" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusChartData} barGap={4} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
                  <Bar
                    dataKey="value"
                    name="Incidentes"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  >
                    {statusChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-chart-3/10 p-2">
                <PieChartIcon className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <CardTitle className="text-sm">{t("reports.priorityDistribution") || "Distribución por Prioridad"}</CardTitle>
                <CardDescription>{t("reports.priorityDesc") || "Incidentes según nivel de prioridad"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px] w-full rounded-lg" />
            ) : priorityChartData.length === 0 ? (
              <EmptyChart state="No hay incidentes registrados" />
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={priorityChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {priorityChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Area Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-chart-4/10 p-2">
              <Activity className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <CardTitle className="text-sm">{t("reports.areaBreakdown") || "Incidentes por Área"}</CardTitle>
              <CardDescription>{t("reports.areaDesc") || "Distribución de incidentes por área operativa"}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : isAreaEmpty ? (
            <EmptyChart state="No hay datos por área" />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, areaChartData.length * 44)}>
              <BarChart
                data={areaChartData}
                layout="vertical"
                barGap={4}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                  width={120}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
                <Bar
                  dataKey="value"
                  name="Incidentes"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={36}
                >
                  {areaChartData.map((_, i) => (
                    <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Sub-components ────────────────────────────

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  loading: boolean;
  color: string;
  bg: string;
}

function KpiCard({ icon: Icon, label, value, loading, color, bg }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className={cn("mt-1 text-3xl font-bold text-card-foreground")}>
                {value}
              </p>
            )}
          </div>
          <div className={cn("rounded-lg p-2.5", bg)}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyChart({ state }: { state: string }) {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center text-muted-foreground">
      <BarChart3 className="mb-2 h-10 w-10 opacity-40" />
      <p className="text-sm">{state}</p>
    </div>
  );
}
