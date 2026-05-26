"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Incident } from "@/lib/store";

interface TimelineChartProps {
  incidents: Incident[];
}

export function TimelineChart({ incidents }: TimelineChartProps) {
  const groupByDate = (incidents: Incident[]) => {
    const grouped: Record<string, { abiertos: number; cerrados: number }> = {};

    incidents.forEach((incident) => {
      const fecha = incident.fechaCreacion || incident.createdAt || "";
      const date = new Date(fecha).toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
      });

      if (!grouped[date]) {
        grouped[date] = { abiertos: 0, cerrados: 0 };
      }

      grouped[date].abiertos++;

      if (incident.estado === "cerrado") {
        grouped[date].cerrados++;
      }
    });

    return Object.entries(grouped)
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))
      .slice(-10);
  };

  const data = groupByDate(incidents);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))" 
          opacity={0.3} 
        />
        <XAxis 
          dataKey="date" 
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
        />
        <Legend 
          wrapperStyle={{
            color: "hsl(var(--foreground))",
          }}
        />
        <Line
          type="monotone"
          dataKey="abiertos"
          stroke="hsl(var(--destructive))"
          strokeWidth={2}
          name="Reportados"
          dot={{ fill: "hsl(var(--destructive))", r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="cerrados"
          stroke="hsl(142 71% 45%)"
          strokeWidth={2}
          name="Cerrados"
          dot={{ fill: "hsl(142 71% 45%)", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
