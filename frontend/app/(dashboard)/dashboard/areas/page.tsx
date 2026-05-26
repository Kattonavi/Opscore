"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import { Building2, MapPin, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AreaInfo {
  id: number;
  name: string;
  description: string;
  color: string;
  incidentCount: number;
}

const AREAS_DATA: AreaInfo[] = [
  {
    id: 1,
    name: "PRODUCTION",
    description: "Área de producción. Manejo de líneas de producción, maquinaria y procesos industriales.",
    color: "#EF4444",
    incidentCount: 12,
  },
  {
    id: 2,
    name: "CONTABILITY",
    description: "Área de contabilidad. Gestión financiera, facturación y reportes contables.",
    color: "#F59E0B",
    incidentCount: 5,
  },
  {
    id: 3,
    name: "RRHH",
    description: "Recursos Humanos. Administración de personal, nóminas y relaciones laborales.",
    color: "#8B5CF6",
    incidentCount: 8,
  },
  {
    id: 4,
    name: "LOGISTICS",
    description: "Área de logística. Gestión de inventarios, almacenes y distribución.",
    color: "#14B8A6",
    incidentCount: 6,
  },
  {
    id: 5,
    name: "QUALITY",
    description: "Control de calidad. Aseguramiento de calidad, inspecciones y certificaciones.",
    color: "#84CC16",
    incidentCount: 9,
  },
  {
    id: 6,
    name: "MAINTENANCE",
    description: "Mantenimiento industrial. Reparación y mantenimiento preventivo de equipos.",
    color: "#6366F1",
    incidentCount: 15,
  },
  {
    id: 7,
    name: "IT",
    description: "Tecnología de la información. Soporte técnico, sistemas y redes.",
    color: "#3B82F6",
    incidentCount: 11,
  },
  {
    id: 8,
    name: "SECURITY",
    description: "Seguridad industrial y patrimonial. Vigilancia, control de acceso y prevención de riesgos.",
    color: "#DC2626",
    incidentCount: 4,
  },
];

const AREA_COLORS: Record<string, string> = {
  PRODUCTION: "text-red-500",
  CONTABILITY: "text-amber-500",
  RRHH: "text-purple-500",
  LOGISTICS: "text-teal-500",
  QUALITY: "text-lime-500",
  MAINTENANCE: "text-indigo-500",
  IT: "text-blue-500",
  SECURITY: "text-red-600",
};

const AREA_BGS: Record<string, string> = {
  PRODUCTION: "bg-red-500/10",
  CONTABILITY: "bg-amber-500/10",
  RRHH: "bg-purple-500/10",
  LOGISTICS: "bg-teal-500/10",
  QUALITY: "bg-lime-500/10",
  MAINTENANCE: "bg-indigo-500/10",
  IT: "bg-blue-500/10",
  SECURITY: "bg-red-600/10",
};

function getAreaColor(name: string): string {
  return AREA_COLORS[name] || "text-muted-foreground";
}

function getAreaBg(name: string): string {
  return AREA_BGS[name] || "bg-muted";
}

export default function AreasPage() {
  const { t, mounted } = useI18n();

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("nav.areas") || "Áreas"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("areasPage.subtitle") || "Áreas operativas del sistema"}
        </p>
      </div>

      {/* Area Cards */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {AREAS_DATA.map((area) => (
          <Card
            key={area.id}
            className="transition-colors hover:border-primary/50"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("rounded-lg p-2.5", getAreaBg(area.name))}>
                    <Building2 className={cn("h-5 w-5", getAreaColor(area.name))} />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {area.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="mt-0.5 text-[10px] font-mono"
                      style={{ borderColor: area.color + "40", color: area.color }}
                    >
                      #{area.color}
                    </Badge>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {area.incidentCount}
                </Badge>
              </div>
              <CardDescription className="mt-3 text-sm">
                {area.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {area.incidentCount === 1
                    ? (t("areasPage.oneIncident") || "1 incidente")
                    : (t("areasPage.nIncidents", { count: area.incidentCount }) || `${area.incidentCount} incidentes`)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
