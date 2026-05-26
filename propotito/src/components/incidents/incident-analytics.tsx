"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18nStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";

interface IncidentAnalyticsProps {
  stats: {
    total: number;
    abiertos: number;
    enProceso: number;
    cerrados: number;
    tiempoPromedioResolucion: number;
    porTipo: Record<string, number>;
    porArea: Record<string, number>;
    porPrioridad: Record<string, number>;
  };
}

export function IncidentAnalytics({ stats }: IncidentAnalyticsProps) {
  const { language } = useI18nStore();
  const t = useTranslation(language);

  const getPercentage = (value: number) => {
    return stats.total > 0 ? ((value / stats.total) * 100).toFixed(1) : "0";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
              {t.incidents.stats.byType}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats.porTipo).map(([tipo, count]) => (
              <div key={tipo} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t.incidents.type[tipo as keyof typeof t.incidents.type]}
                  </span>
                  <span className="font-medium">
                    {count} ({getPercentage(count)}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${getPercentage(count)}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="w-5 h-5 text-accent" />
              {t.incidents.stats.byArea}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats.porArea).map(([area, count]) => (
              <div key={area} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t.incidents.area[area as keyof typeof t.incidents.area]}
                  </span>
                  <span className="font-medium">
                    {count} ({getPercentage(count)}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${getPercentage(count)}%` }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              {t.incidents.stats.byPriority}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats.porPrioridad).map(([prioridad, count]) => {
              const colors = {
                baja: "bg-muted",
                media: "bg-accent",
                alta: "bg-primary",
                critica: "bg-destructive",
              };
              return (
                <div key={prioridad} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t.incidents.priority[prioridad as keyof typeof t.incidents.priority]}
                    </span>
                    <span className="font-medium">
                      {count} ({getPercentage(count)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${colors[prioridad as keyof typeof colors]}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${getPercentage(count)}%` }}
                      transition={{ duration: 0.8, delay: 0.7 }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
