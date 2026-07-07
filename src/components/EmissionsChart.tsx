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
import { fmtNumber } from "@/lib/format";
import type { SimulationResult } from "@/types/plant";

interface Props {
  result: SimulationResult;
}

export default function EmissionsChart({ result }: Props) {
  const data = [
    {
      name: "Before TESSA",
      value: Math.round(result.co2BeforeTonnes),
      color: CHART.muted,
    },
    {
      name: "After TESSA",
      value: Math.round(result.co2AfterTonnes),
      color: CHART.volt,
    },
  ];
  const cutPct =
    result.co2BeforeTonnes > 0
      ? Math.round((result.co2ReductionTonnes / result.co2BeforeTonnes) * 100)
      : 0;

  return (
    <ChartCard
      title="Annual CO₂ emissions — before vs after"
      subtitle={`${fmtNumber(result.co2ReductionTonnes)} tonnes avoided per year (−${cutPct}%)`}
      table={{
        caption: "Annual CO2 emissions before and after TESSA",
        headers: ["Scenario", "CO₂ (tonnes / year)"],
        rows: data.map((d) => [d.name, fmtNumber(d.value)]),
      }}
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 24, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid stroke={CHART.grid} strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ ...TICK_STYLE, fill: "#eef2f8" }}
            axisLine={{ stroke: CHART.grid }}
            tickLine={false}
          />
          <YAxis
            tick={TICK_STYLE}
            tickFormatter={(v: number) => fmtNumber(v)}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            cursor={{ fill: "rgba(147,160,181,0.06)" }}
            content={({ active, payload, label }) => (
              <ChartTooltip
                active={active}
                payload={payload}
                label={label}
                valueFormatter={(v) => `${fmtNumber(v)} t`}
              />
            )}
          />
          <Bar
            name="CO₂ emissions"
            dataKey="value"
            barSize={24}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
            <LabelList
              dataKey="value"
              position="top"
              formatter={(v) => fmtNumber(Number(v))}
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
