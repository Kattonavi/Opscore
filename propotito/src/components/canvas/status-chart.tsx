"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useI18nStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";

interface StatusChartProps {
  stats: {
    abiertos: number;
    enProceso: number;
    cerrados: number;
  };
}

export function StatusChart({ stats }: StatusChartProps) {
  const { language } = useI18nStore();
  const t = useTranslation(language);

  const data = [
    {
      name: t.incidents.status.abierto,
      value: stats.abiertos,
      color: "hsl(var(--destructive))",
    },
    {
      name: t.incidents.status.en_proceso,
      value: stats.enProceso,
      color: "hsl(45 93% 47%)",
    },
    {
      name: t.incidents.status.cerrado,
      value: stats.cerrados,
      color: "hsl(142 71% 45%)",
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))" 
          opacity={0.3} 
        />
        <XAxis 
          dataKey="name" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            color: "hsl(var(--card-foreground))",
          }}
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
