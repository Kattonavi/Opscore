"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { IncidentStatus } from "@/api/incidents/types";
import { AlertTriangle, Clock, CheckCircle2, XCircle, PauseCircle, Play, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StateInfo {
  value: IncidentStatus;
  labelKey: string;
  description: string;
  icon: typeof AlertTriangle;
  color: string;
  bg: string;
  nextStates: IncidentStatus[];
}

const ESTADOS_CONFIG: StateInfo[] = [
  {
    value: IncidentStatus.OPEN,
    labelKey: "incidents.status.OPEN",
    description: "Incidente reportado, esperando asignación a un técnico.",
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    nextStates: [IncidentStatus.ASSIGNED, IncidentStatus.CANCELED],
  },
  {
    value: IncidentStatus.ASSIGNED,
    labelKey: "incidents.status.ASSIGNED",
    description: "Incidente asignado a un técnico, esperando inicio de resolución.",
    icon: Play,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    nextStates: [IncidentStatus.IN_PROGRESS, IncidentStatus.OPEN, IncidentStatus.CANCELED],
  },
  {
    value: IncidentStatus.IN_PROGRESS,
    labelKey: "incidents.status.IN_PROGRESS",
    description: "El técnico está trabajando activamente en la resolución.",
    icon: Clock,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    nextStates: [IncidentStatus.ON_HOLD, IncidentStatus.RESOLVED],
  },
  {
    value: IncidentStatus.ON_HOLD,
    labelKey: "incidents.status.ON_HOLD",
    description: "Resolución pausada temporalmente por el técnico.",
    icon: PauseCircle,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    nextStates: [IncidentStatus.IN_PROGRESS, IncidentStatus.CANCELED],
  },
  {
    value: IncidentStatus.RESOLVED,
    labelKey: "incidents.status.RESOLVED",
    description: "Solución aplicada, pendiente de cierre por supervisor.",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    nextStates: [IncidentStatus.CLOSED, IncidentStatus.IN_PROGRESS],
  },
  {
    value: IncidentStatus.CLOSED,
    labelKey: "incidents.status.CLOSED",
    description: "Incidente cerrado formalmente. No admite más cambios.",
    icon: CheckCircle2,
    color: "text-muted-foreground",
    bg: "bg-muted",
    nextStates: [],
  },
  {
    value: IncidentStatus.CANCELED,
    labelKey: "incidents.status.CANCELED",
    description: "Incidente cancelado. No se requiere resolución.",
    icon: Ban,
    color: "text-destructive",
    bg: "bg-destructive/10",
    nextStates: [],
  },
];

export default function EstadosPage() {
  const { t, mounted } = useI18n();

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("estadosPage.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("estadosPage.subtitle")}
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {ESTADOS_CONFIG.map((state) => {
          const Icon = state.icon;
          return (
            <Card
              key={state.value}
              className="transition-colors hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={cn("rounded-lg p-2.5", state.bg)}>
                    <Icon className={cn("h-5 w-5", state.color)} />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {t(state.labelKey)}
                    </CardTitle>
                    <Badge variant="outline" className="mt-0.5 text-[10px] font-mono">
                      {state.value}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="mt-2 text-sm">
                  {state.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {state.nextStates.length > 0 ? (
                  <>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("estadosPage.nextStates")}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {state.nextStates.map((next) => {
                        const nextCfg = ESTADOS_CONFIG.find((s) => s.value === next)!;
                        const NextIcon = nextCfg.icon;
                        return (
                          <div
                            key={next}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium",
                              nextCfg.bg,
                              nextCfg.color,
                            )}
                          >
                            <NextIcon className="h-3 w-3" />
                            {t(nextCfg.labelKey)}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Estado final
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transitions diagram hint */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <XCircle className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              Diagrama de flujo de transiciones próximamente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
