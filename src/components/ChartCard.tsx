"use client";

import type { TooltipContentProps } from "recharts";
import { useI18n } from "@/components/LanguageProvider";

/** Chart palette — validated against the card surface (#101d33), dark mode. */
export const CHART = {
  volt: "#4c8dff",
  ember: "#e2661a",
  red: "#e0504f",
  /** De-emphasis series ("before" baselines) — deliberately recessive. */
  muted: "#6b7c96",
  grid: "#1c2b47",
  tick: "#93a0b5",
} as const;

export const TICK_STYLE = {
  fill: CHART.tick,
  fontSize: 11,
  fontVariantNumeric: "tabular-nums",
} as const;

export interface LegendItem {
  color: string;
  label: string;
}

interface TableSpec {
  caption: string;
  headers: string[];
  rows: (string | number)[][];
}

interface Props {
  title: string;
  subtitle?: string;
  legend?: LegendItem[];
  table: TableSpec;
  children: React.ReactNode;
}

/** Card shell shared by every chart: title, legend, plot, and a table view. */
export default function ChartCard({
  title,
  subtitle,
  legend,
  table,
  children,
}: Props) {
  const { t } = useI18n();
  return (
    <section className="flex flex-col rounded-2xl border border-edge bg-card p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-txt-2">{subtitle}</p>
          ) : null}
        </div>
        {legend && legend.length > 1 ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {legend.map((l) => (
              <span
                key={l.label}
                className="flex items-center gap-1.5 text-xs text-txt-2"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: l.color }}
                />
                {l.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
      <details className="mt-3 border-t border-edge pt-2.5">
        <summary className="cursor-pointer text-xs text-txt-3 select-none hover:text-txt-2">
          {t.common.viewData}
        </summary>
        <div className="mt-2 max-h-56 overflow-auto">
          <table className="w-full text-left text-xs [font-variant-numeric:tabular-nums]">
            <caption className="sr-only">{table.caption}</caption>
            <thead>
              <tr>
                {table.headers.map((h) => (
                  <th
                    key={h}
                    className="border-b border-edge py-1.5 pr-4 font-medium text-txt-2"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="border-b border-edge/50 py-1.5 pr-4 text-txt-2"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

/** Dark tooltip shared by all charts. */
export function ChartTooltip({
  active,
  label,
  payload,
  labelFormatter,
  valueFormatter,
}: Pick<TooltipContentProps<number, string>, "active" | "label" | "payload"> & {
  labelFormatter?: (label: unknown) => string;
  valueFormatter: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#2a3b5c] bg-[#0d1830]/95 px-3 py-2 shadow-xl">
      <p className="mb-1 text-[11px] font-medium text-txt-2">
        {labelFormatter ? labelFormatter(label) : String(label)}
      </p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey as string}
          className="flex items-center gap-1.5 text-xs text-txt"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-txt-2">{entry.name}:</span>
          <span className="[font-variant-numeric:tabular-nums]">
            {valueFormatter(Number(entry.value ?? 0))}
          </span>
        </p>
      ))}
    </div>
  );
}
