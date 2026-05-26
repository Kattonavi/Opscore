"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useI18nStore } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";

interface PriorityChartProps {
  stats: {
    porPrioridad: Record<string, number>;
  };
}

const COLORS = {
  baja: "hsl(217 91% 60%)",
  media: "hsl(45 93% 47%)",
  alta: "hsl(25 95% 53%)",
  critica: "hsl(var(--destructive))",
};

export function PriorityChart({ stats }: PriorityChartProps) {
  const { language } = useI18nStore();
  const t = useTranslation(language);

  const data = Object.entries(stats.porPrioridad).map(([key, value]) => ({
    name: t.incidents.priority[key as keyof typeof t.incidents.priority],
    value,
    color: COLORS[key as keyof typeof COLORS],
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={120}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
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
      </PieChart>
    </ResponsiveContainer>
  );
}
