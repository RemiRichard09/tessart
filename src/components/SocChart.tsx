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
import { fmtHour, fmtNumber } from "@/lib/format";
import type { SocPoint } from "@/types/plant";

interface Props {
  data: SocPoint[];
  sizeMWh: number;
}

export default function SocChart({ data, sizeMWh }: Props) {
  return (
    <ChartCard
      title="TESSA state of charge — 24 hours"
      subtitle={`Charges overnight, discharges across the shift · capacity ${fmtNumber(sizeMWh, 1)} MWh`}
      table={{
        caption: "TESSA state of charge by hour",
        headers: ["Hour", "State of charge (%)", "Stored (MWh)"],
        rows: data.map((d) => [
          fmtHour(d.hour),
          d.socPct,
          fmtNumber(d.socMWh, 1),
        ]),
      }}
    >
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
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
                labelFormatter={(l) => fmtHour(Number(l))}
                valueFormatter={(v) => `${fmtNumber(v)} %`}
              />
            )}
          />
          <Area
            name="State of charge"
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
