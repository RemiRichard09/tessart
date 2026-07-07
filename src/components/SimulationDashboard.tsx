"use client";

import { useMemo } from "react";
import EmissionsChart from "@/components/EmissionsChart";
import LoadCurveChart from "@/components/LoadCurveChart";
import SavingsBreakdownChart from "@/components/SavingsBreakdownChart";
import SocChart from "@/components/SocChart";
import { buildLoadCurve, buildSocCurve } from "@/lib/calculations";
import {
  fmtCurrencyCompact,
  fmtNumber,
  fmtYears,
} from "@/lib/format";
import type { PlantInput, SimulationResult } from "@/types/plant";

interface Props {
  input: PlantInput;
  result: SimulationResult;
}

function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "volt" | "ember" | "red";
}) {
  const accentClass =
    accent === "volt"
      ? "text-volt"
      : accent === "ember"
        ? "text-ember-bright"
        : accent === "red"
          ? "text-accent-bright"
          : "";
  return (
    <div className="rounded-2xl border border-edge bg-card p-5">
      <p className="text-[13px] font-medium text-txt-2">{label}</p>
      <p className={`mt-1.5 text-[26px] leading-tight font-semibold ${accentClass}`}>
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-txt-3">{sub}</p> : null}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-semibold tracking-widest text-txt-3 uppercase">
      {children}
    </h3>
  );
}

export default function SimulationDashboard({ input, result }: Props) {
  const loadCurve = useMemo(
    () => buildLoadCurve(input, result),
    [input, result],
  );
  const socCurve = useMemo(() => buildSocCurve(input, result), [input, result]);

  return (
    <div className="space-y-8">
      {/* Headline */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr]">
        <div className="rounded-2xl border border-edge bg-gradient-to-br from-card to-card-2 p-7">
          <p className="text-[13px] font-medium text-txt-2">
            Total annual savings
          </p>
          <p className="mt-2 text-[52px] leading-none font-semibold tracking-tight">
            {fmtCurrencyCompact(result.totalSavings)}
          </p>
          <p className="mt-3 text-sm text-txt-2">
            {fmtCurrencyCompact(result.fuelSavings)} fuel ·{" "}
            {fmtCurrencyCompact(result.demandSavings)} demand charges
          </p>
        </div>
        <StatTile
          label="Simple payback"
          value={fmtYears(result.paybackYears)}
          sub={`on ${fmtCurrencyCompact(result.netCapex)} net CAPEX`}
          accent="red"
        />
        <StatTile
          label="CO₂ reduction"
          value={`${fmtNumber(result.co2ReductionTonnes)} t/yr`}
          sub="versus current heat source"
        />
      </div>

      {/* Configuration */}
      <div>
        <SectionHeading>Recommended TESSA configuration</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatTile
            label="Storage size"
            value={`${fmtNumber(result.sizeMWh, 1)} MWh`}
            sub={`½ of ${fmtNumber(result.dailyThermalMWh, 1)} MWh daily demand`}
            accent="ember"
          />
          <StatTile
            label="Charge power"
            value={`${fmtNumber(result.chargePowerKW)} kW`}
            sub="12 h off-peak window"
            accent="volt"
          />
          <StatTile
            label="Discharge power"
            value={`${fmtNumber(result.dischargePowerKW)} kW`}
            sub={`over ${fmtNumber(input.operatingHoursPerDay)} h shift`}
            accent="ember"
          />
          <StatTile
            label="Peak reduction"
            value={`${fmtNumber(result.peakReductionKW)} kW`}
            sub={`of ${fmtNumber(input.peakDemandKW)} kW peak`}
            accent="volt"
          />
          <StatTile
            label="Energy shifted"
            value={`${fmtNumber(result.energyShiftedMWh)} MWh/yr`}
            sub="fuel displaced by off-peak power"
          />
        </div>
      </div>

      {/* Investment */}
      <div>
        <SectionHeading>Investment</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Estimated CAPEX"
            value={fmtCurrencyCompact(result.capex)}
            sub="at $150K per MWh installed"
          />
          <StatTile
            label="Subsidy estimate"
            value={`−${fmtCurrencyCompact(result.subsidy)}`}
            sub="Hydro-Québec incentive, capped at 75%"
            accent="volt"
          />
          <StatTile
            label="Net CAPEX"
            value={fmtCurrencyCompact(result.netCapex)}
            sub="after incentives"
          />
          <StatTile
            label="Annual fuel savings"
            value={fmtCurrencyCompact(result.fuelSavings)}
            sub="net of off-peak charging cost"
            accent="ember"
          />
        </div>
      </div>

      {/* Charts */}
      <div>
        <SectionHeading>Simulation charts</SectionHeading>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <LoadCurveChart data={loadCurve} />
          </div>
          <SocChart data={socCurve} sizeMWh={result.sizeMWh} />
          <SavingsBreakdownChart result={result} />
          <div className="lg:col-span-2">
            <EmissionsChart result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
