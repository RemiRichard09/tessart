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
import { fmtCurrency, fmtCurrencyCompact } from "@/lib/format";
import type { SimulationResult } from "@/types/plant";

interface Props {
  result: SimulationResult;
}

export default function SavingsBreakdownChart({ result }: Props) {
  const data = [
    {
      name: "Fuel savings",
      value: Math.round(result.fuelSavings),
      color: CHART.ember,
    },
    {
      name: "Demand savings",
      value: Math.round(result.demandSavings),
      color: CHART.volt,
    },
  ];

  return (
    <ChartCard
      title="Annual savings breakdown"
      subtitle={`Total ${fmtCurrencyCompact(result.totalSavings)} per year (CAD)`}
      legend={[
        { color: CHART.ember, label: "Displaced fuel (net of charging)" },
        { color: CHART.volt, label: "Peak demand charges" },
      ]}
      table={{
        caption: "Annual savings by category",
        headers: ["Category", "Annual savings (CAD)"],
        rows: data.map((d) => [d.name, fmtCurrency(d.value)]),
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
            tickFormatter={(v: number) => fmtCurrencyCompact(v)}
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
                valueFormatter={(v) => fmtCurrency(v)}
              />
            )}
          />
          <Bar
            name="Annual savings"
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
              formatter={(v) => fmtCurrencyCompact(Number(v))}
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
