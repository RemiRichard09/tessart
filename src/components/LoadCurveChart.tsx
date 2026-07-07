"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard, { CHART, ChartTooltip, TICK_STYLE } from "@/components/ChartCard";
import { fmtHour, fmtNumber } from "@/lib/format";
import type { LoadCurvePoint } from "@/types/plant";

interface Props {
  data: LoadCurvePoint[];
}

export default function LoadCurveChart({ data }: Props) {
  return (
    <ChartCard
      title="Daily electricity load — before vs after TESSA"
      subtitle="Peak shaved during the shift; overnight valley filled by off-peak charging (kW)"
      legend={[
        { color: CHART.muted, label: "Before TESSA" },
        { color: CHART.volt, label: "After TESSA" },
      ]}
      table={{
        caption: "Hourly electrical load before and after TESSA",
        headers: ["Hour", "Before (kW)", "After (kW)"],
        rows: data.map((d) => [
          fmtHour(d.hour),
          fmtNumber(d.before),
          fmtNumber(d.after),
        ]),
      }}
    >
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid stroke={CHART.grid} strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="hour"
            ticks={[0, 6, 12, 18, 23]}
            tickFormatter={fmtHour}
            tick={TICK_STYLE}
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
            cursor={{ stroke: CHART.tick, strokeWidth: 1 }}
            content={({ active, payload, label }) => (
              <ChartTooltip
                active={active}
                payload={payload}
                label={label}
                labelFormatter={(l) => fmtHour(Number(l))}
                valueFormatter={(v) => `${fmtNumber(v)} kW`}
              />
            )}
          />
          <Line
            name="Before TESSA"
            dataKey="before"
            type="monotone"
            stroke={CHART.muted}
            strokeWidth={2}
            strokeLinecap="round"
            dot={false}
            isAnimationActive={false}
          />
          <Area
            name="After TESSA"
            dataKey="after"
            type="monotone"
            stroke={CHART.volt}
            strokeWidth={2}
            strokeLinecap="round"
            fill={CHART.volt}
            fillOpacity={0.1}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
