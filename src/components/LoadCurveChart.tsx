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
import { useI18n } from "@/components/LanguageProvider";
import type { LoadCurvePoint } from "@/types/plant";

interface Props {
  data: LoadCurvePoint[];
}

export default function LoadCurveChart({ data }: Props) {
  const { t, fmt } = useI18n();
  const c = t.charts.load;

  return (
    <ChartCard
      title={c.title}
      subtitle={c.subtitle}
      legend={[
        { color: CHART.muted, label: c.before },
        { color: CHART.volt, label: c.after },
      ]}
      table={{
        caption: c.caption,
        headers: [c.hour, c.beforeKw, c.afterKw],
        rows: data.map((d) => [
          fmt.hour(d.hour),
          fmt.number(d.before),
          fmt.number(d.after),
        ]),
      }}
    >
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid stroke={CHART.grid} strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="hour"
            ticks={[0, 6, 12, 18, 23]}
            tickFormatter={fmt.hour}
            tick={TICK_STYLE}
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
            cursor={{ stroke: CHART.tick, strokeWidth: 1 }}
            content={({ active, payload, label }) => (
              <ChartTooltip
                active={active}
                payload={payload}
                label={label}
                labelFormatter={(l) => fmt.hour(Number(l))}
                valueFormatter={(v) => `${fmt.number(v)} kW`}
              />
            )}
          />
          <Line
            name={c.before}
            dataKey="before"
            type="monotone"
            stroke={CHART.muted}
            strokeWidth={2}
            strokeLinecap="round"
            dot={false}
            isAnimationActive={false}
          />
          <Area
            name={c.after}
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
