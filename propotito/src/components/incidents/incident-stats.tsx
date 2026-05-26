"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useI18nStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { Clock, TrendingUp } from "lucide-react";

interface IncidentStatsProps {
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

export function IncidentStats({ stats }: IncidentStatsProps) {
  const { language } = useI18nStore();
  const t = useTranslation(language);

  const resolutionRate = stats.total > 0 ? (stats.cerrados / stats.total) * 100 : 0;
  const avgTimeHours = Math.floor(stats.tiempoPromedioResolucion / 60);
  const avgTimeMinutes = Math.floor(stats.tiempoPromedioResolucion % 60);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
              Tasa de Resolución
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-primary">
                  {resolutionRate.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.cerrados} de {stats.total} incidentes resueltos
                </p>
              </div>
            </div>
            <Progress value={resolutionRate} className="h-3" />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-accent" />
              {t.incidents.stats.avgResolutionTime}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold text-accent">
                {avgTimeHours > 0 ? `${avgTimeHours}h` : `${avgTimeMinutes}m`}
              </p>
              {avgTimeHours > 0 && avgTimeMinutes > 0 && (
                <p className="text-2xl font-medium text-muted-foreground mb-1">
                  {avgTimeMinutes}m
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Promedio basado en {stats.cerrados} incidentes cerrados
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
