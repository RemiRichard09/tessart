"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard, { CHART, ChartTooltip, TICK_STYLE } from "@/components/ChartCard";
import { useI18n } from "@/components/LanguageProvider";
import type { SocPoint } from "@/types/plant";

interface Props {
  data: SocPoint[];
  sizeMWh: number;
}

export default function SocChart({ data, sizeMWh }: Props) {
  const { t, fmt } = useI18n();
  const c = t.charts.soc;

  return (
    <ChartCard
      title={c.title}
      subtitle={c.subtitle(fmt.number(sizeMWh, 1))}
      table={{
        caption: c.caption,
        headers: [c.hour, c.socPct, c.stored],
        rows: data.map((d) => [
          fmt.hour(d.hour),
          d.socPct,
          fmt.number(d.socMWh, 1),
        ]),
      }}
    >
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
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
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(v: number) => `${v}%`}
            tick={TICK_STYLE}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            cursor={{ stroke: CHART.tick, strokeWidth: 1 }}
            content={({ active, payload, label }) => (
              <ChartTooltip
                active={active}
                payload={payload}
                label={label}
                labelFormatter={(l) => fmt.hour(Number(l))}
                valueFormatter={(v) => `${fmt.number(v)} %`}
              />
            )}
          />
          <Area
            name={c.series}
            dataKey="socPct"
            type="monotone"
            stroke={CHART.ember}
            strokeWidth={2}
            strokeLinecap="round"
            fill={CHART.ember}
            fillOpacity={0.12}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
