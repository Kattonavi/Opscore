"use client";

import { motion } from "framer-motion";
import { Incident, IncidentArea, IncidentType } from "@/lib/store";
import { useI18nStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface HeatmapChartProps {
  incidents: Incident[];
}

export function HeatmapChart({ incidents }: HeatmapChartProps) {
  const { language } = useI18nStore();
  const t = useTranslation(language);

  const areas: IncidentArea[] = ["produccion", "mantenimiento", "calidad", "seguridad", "logistica"];
  const types: IncidentType[] = ["falla_maquina", "accidente", "desviacion_calidad", "otro"];

  const heatmapData: Record<string, Record<string, number>> = {};

  areas.forEach((area) => {
    heatmapData[area] = {};
    types.forEach((type) => {
      heatmapData[area][type] = 0;
    });
  });

  incidents.forEach((incident) => {
    const areaKey = incident.area || "produccion";
    const tipoKey = incident.tipo || "otro";
    if (heatmapData[areaKey] && heatmapData[areaKey][tipoKey] !== undefined) {
      heatmapData[areaKey][tipoKey]++;
    }
  });

  const maxValue = Math.max(
    ...Object.values(heatmapData).flatMap((row) => Object.values(row))
  );

  const getColorClass = (value: number) => {
    if (maxValue === 0) return "bg-muted";
    const intensity = value / maxValue;
    if (intensity === 0) return "bg-muted";
    if (intensity < 0.25) return "bg-blue-500/20 dark:bg-blue-500/30";
    if (intensity < 0.5) return "bg-yellow-500/40 dark:bg-yellow-500/50";
    if (intensity < 0.75) return "bg-orange-500/60 dark:bg-orange-500/70";
    return "bg-red-500/80 dark:bg-red-500/90";
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${types.length}, 1fr)` }}>
            <div className="p-2" />
            {types.map((type) => (
              <div key={type} className="p-2 text-xs font-medium text-center text-muted-foreground">
                {t.incidents.type[type]}
              </div>
            ))}

            {areas.map((area, areaIndex) => (
              <>
                <div key={`label-${area}`} className="p-2 text-xs font-medium flex items-center text-muted-foreground">
                  {t.incidents.area[area]}
                </div>
                {types.map((type, typeIndex) => {
                  const value = heatmapData[area][type];
                  return (
                    <motion.div
                      key={`${area}-${type}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: (areaIndex * types.length + typeIndex) * 0.05,
                      }}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                      className={cn(
                        "p-4 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer relative group transition-all",
                        getColorClass(value)
                      )}
                    >
                      <span className="text-foreground">{value}</span>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-md border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                        {t.incidents.area[area]} - {t.incidents.type[type]}: {value}
                      </div>
                    </motion.div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-muted border border-border" />
          <span className="text-muted-foreground">0</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-blue-500/20 dark:bg-blue-500/30 border border-border" />
          <span className="text-muted-foreground">Bajo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-yellow-500/40 dark:bg-yellow-500/50 border border-border" />
          <span className="text-muted-foreground">Medio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-orange-500/60 dark:bg-orange-500/70 border border-border" />
          <span className="text-muted-foreground">Alto</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-red-500/80 dark:bg-red-500/90 border border-border" />
          <span className="text-muted-foreground">Crítico</span>
        </div>
      </div>
    </div>
  );
}
