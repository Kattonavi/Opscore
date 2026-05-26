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

interface TypeChartProps {
  stats: {
    porTipo: Record<string, number>;
  };
}

const COLORS = {
  falla_maquina: "hsl(262 83% 58%)",
  accidente: "hsl(var(--destructive))",
  desviacion_calidad: "hsl(38 92% 50%)",
  otro: "hsl(215 16% 47%)",
};

export function TypeChart({ stats }: TypeChartProps) {
  const { language } = useI18nStore();
  const t = useTranslation(language);

  const data = Object.entries(stats.porTipo).map(([key, value]) => ({
    name: t.incidents.type[key as keyof typeof t.incidents.type],
    value,
    color: COLORS[key as keyof typeof COLORS],
  }));

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="hsl(var(--primary-foreground))"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-sm font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
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
