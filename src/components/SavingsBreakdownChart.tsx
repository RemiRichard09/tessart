"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard, { CHART, ChartTooltip, TICK_STYLE } from "@/components/ChartCard";
import { useI18n } from "@/components/LanguageProvider";
import type { SimulationResult } from "@/types/plant";

interface Props {
  result: SimulationResult;
}

export default function SavingsBreakdownChart({ result }: Props) {
  const { t, fmt } = useI18n();
  const c = t.charts.savings;

  const data = [
    {
      name: c.catFuel,
      value: Math.round(result.fuelSavings),
      color: CHART.ember,
    },
    {
      name: c.catDemand,
      value: Math.round(result.demandSavings),
      color: CHART.volt,
    },
  ];

  return (
    <ChartCard
      title={c.title}
      subtitle={c.subtitle(fmt.currencyCompact(result.totalSavings))}
      legend={[
        { color: CHART.ember, label: c.legendFuel },
        { color: CHART.volt, label: c.legendDemand },
      ]}
      table={{
        caption: c.caption,
        headers: [c.category, c.annual],
        rows: data.map((d) => [d.name, fmt.currency(d.value)]),
      }}
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 76, left: 8, bottom: 0 }}
        >
          <CartesianGrid stroke={CHART.grid} strokeWidth={1} horizontal={false} />
          <XAxis
            type="number"
            tick={TICK_STYLE}
            tickFormatter={(v: number) => fmt.currencyCompact(v)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ ...TICK_STYLE, fill: "#eef2f8" }}
            axisLine={{ stroke: CHART.grid }}
            tickLine={false}
            width={110}
          />
          <Tooltip
            cursor={{ fill: "rgba(147,160,181,0.06)" }}
            content={({ active, payload, label }) => (
              <ChartTooltip
                active={active}
                payload={payload}
                label={label}
                valueFormatter={(v) => fmt.currency(v)}
              />
            )}
          />
          <Bar
            name={c.series}
            dataKey="value"
            barSize={24}
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v) => fmt.currencyCompact(Number(v))}
              style={{
                fill: "#eef2f8",
                fontSize: 12,
                fontWeight: 600,
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
