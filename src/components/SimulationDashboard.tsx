"use client";

import { useMemo } from "react";
import EmissionsChart from "@/components/EmissionsChart";
import { useI18n } from "@/components/LanguageProvider";
import LoadCurveChart from "@/components/LoadCurveChart";
import SavingsBreakdownChart from "@/components/SavingsBreakdownChart";
import SocChart from "@/components/SocChart";
import { buildLoadCurve, buildSocCurve } from "@/lib/calculations";
import { ASSUMPTIONS } from "@/lib/defaults";
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
  const { t, fmt } = useI18n();
  const d = t.dashboard;
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
          <p className="text-[13px] font-medium text-txt-2">{d.totalSavings}</p>
          <p className="mt-2 text-[52px] leading-none font-semibold tracking-tight">
            {fmt.currencyCompact(result.totalSavings)}
          </p>
          <p className="mt-3 text-sm text-txt-2">
            {d.savingsSplit(
              fmt.currencyCompact(result.fuelSavings),
              fmt.currencyCompact(result.demandSavings),
            )}
          </p>
        </div>
        <StatTile
          label={d.payback}
          value={fmt.years(result.paybackYears)}
          sub={d.paybackSub(fmt.currencyCompact(result.netCapex))}
          accent="red"
        />
        <StatTile
          label={d.co2}
          value={d.co2Value(fmt.number(result.co2ReductionTonnes))}
          sub={d.co2Sub}
        />
      </div>

      {/* Configuration */}
      <div>
        <SectionHeading>{d.configSection}</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatTile
            label={d.storageSize}
            value={`${fmt.number(result.sizeMWh, 1)} MWh`}
            sub={d.storageSizeSub(fmt.number(result.dailyThermalMWh, 1))}
            accent="ember"
          />
          <StatTile
            label={d.chargePower}
            value={`${fmt.number(result.chargePowerKW)} kW`}
            sub={d.chargePowerSub(ASSUMPTIONS.chargeDurationHours)}
            accent="volt"
          />
          <StatTile
            label={d.dischargePower}
            value={`${fmt.number(result.dischargePowerKW)} kW`}
            sub={d.dischargePowerSub(fmt.number(input.operatingHoursPerDay))}
            accent="ember"
          />
          <StatTile
            label={d.peakReduction}
            value={`${fmt.number(result.peakReductionKW)} kW`}
            sub={d.peakReductionSub(fmt.number(input.peakDemandKW))}
            accent="volt"
          />
          <StatTile
            label={d.energyShifted}
            value={d.energyShiftedValue(fmt.number(result.energyShiftedMWh))}
            sub={d.energyShiftedSub}
          />
        </div>
      </div>

      {/* Investment */}
      <div>
        <SectionHeading>{d.investSection}</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label={d.capex}
            value={fmt.currencyCompact(result.capex)}
            sub={d.capexSub}
          />
          <StatTile
            label={d.subsidy}
            value={`−${fmt.currencyCompact(result.subsidy)}`}
            sub={d.subsidySub}
            accent="volt"
          />
          <StatTile
            label={d.netCapex}
            value={fmt.currencyCompact(result.netCapex)}
            sub={d.netCapexSub}
          />
          <StatTile
            label={d.fuelSavings}
            value={fmt.currencyCompact(result.fuelSavings)}
            sub={d.fuelSavingsSub}
            accent="ember"
          />
        </div>
      </div>

      {/* Charts */}
      <div>
        <SectionHeading>{d.chartsSection}</SectionHeading>
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
