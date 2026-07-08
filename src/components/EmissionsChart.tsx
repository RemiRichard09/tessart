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

export default function EmissionsChart({ result }: Props) {
  const { t, fmt } = useI18n();
  const c = t.charts.emissions;

  const data = [
    {
      name: c.before,
      value: Math.round(result.co2BeforeTonnes),
      color: CHART.muted,
    },
    {
      name: c.after,
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
      title={c.title}
      subtitle={c.subtitle(fmt.number(result.co2ReductionTonnes), cutPct)}
      table={{
        caption: c.caption,
        headers: [c.scenario, c.co2],
        rows: data.map((d) => [d.name, fmt.number(d.value)]),
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
            tickFormatter={(v: number) => fmt.number(v)}
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
                valueFormatter={(v) => `${fmt.number(v)} t`}
              />
            )}
          />
          <Bar
            name={c.series}
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
              formatter={(v) => fmt.number(Number(v))}
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
