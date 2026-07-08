"use client";

import { useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import { ASSUMPTIONS } from "@/lib/defaults";
import type { PlantInput, SimulationResult } from "@/types/plant";

interface Props {
  input: PlantInput;
  result: SimulationResult;
}

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-edge py-7 first:border-t-0">
      <h3 className="mb-4 text-xs font-semibold tracking-widest text-accent-bright uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function KV({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid gap-x-10 gap-y-2.5 sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-txt-2">{k}</dt>
          <dd className="text-sm font-semibold [font-variant-numeric:tabular-nums]">
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function BusinessCaseReport({ input, result }: Props) {
  const { t, fmt } = useI18n();
  const r = t.report;
  const l = r.labels;
  const [exportNote, setExportNote] = useState(false);

  const narrativeArgs = {
    process: t.options.process[input.process].toLowerCase(),
    heat: t.options.heatSource[input.heatSource].toLowerCase(),
    tempC: fmt.number(input.processTempC),
    chargeKW: fmt.number(result.chargePowerKW),
    chargeHours: ASSUMPTIONS.chargeDurationHours,
    capacityKW: fmt.number(input.availableCapacityKW),
    shiftHours: fmt.number(input.operatingHoursPerDay),
    dischargeKW: fmt.number(result.dischargePowerKW),
    peakReductionKW: fmt.number(result.peakReductionKW),
    efficiencyPct: Math.round(ASSUMPTIONS.roundTripEfficiency * 100),
  };
  const tempFit =
    input.processTempC > ASSUMPTIONS.tessaTempMaxC
      ? r.narrative.tempAbove(narrativeArgs)
      : input.processTempC < ASSUMPTIONS.tessaTempMinC
        ? r.narrative.tempBelow(narrativeArgs)
        : r.narrative.tempIn(narrativeArgs);
  const narrative = [
    r.narrative.intro(narrativeArgs),
    tempFit,
    r.narrative.discharge(narrativeArgs),
  ];

  return (
    <article className="rounded-2xl border border-edge bg-card">
      {/* Report header */}
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-t-2xl bg-gradient-to-br from-card-2 to-card px-8 py-7">
        <div>
          <p className="text-xs font-semibold tracking-widest text-txt-3 uppercase">
            {r.kicker}
          </p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight">
            {input.name}
          </h2>
          <p className="mt-1 text-sm text-txt-2">
            {r.subtitle} · {fmt.date(new Date())}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={() => setExportNote(true)}
            className="rounded-lg border border-edge bg-navy-900 px-4 py-2 text-sm font-semibold text-txt transition-colors hover:border-txt-3"
          >
            {r.exportPdf}
          </button>
          {exportNote ? (
            <p className="text-xs text-txt-3">{r.exportSoon}</p>
          ) : null}
        </div>
      </header>

      <div className="px-8 pb-4">
        <ReportSection title={r.sections.summary}>
          <KV
            rows={[
              [l.industry, t.options.industry[input.industry]],
              [l.process, t.options.process[input.process]],
              [l.heatSource, t.options.heatSource[input.heatSource]],
              [l.processTemp, `${fmt.number(input.processTempC)} °C`],
              [l.annualEnergy, `${fmt.number(input.annualEnergyMWh)} MWh`],
              [l.peakDemand, `${fmt.number(input.peakDemandKW)} kW`],
              [l.availableCapacity, `${fmt.number(input.availableCapacityKW)} kW`],
              [
                l.schedule,
                l.scheduleValue(
                  fmt.number(input.operatingHoursPerDay),
                  fmt.number(input.operatingDaysPerYear),
                ),
              ],
            ]}
          />
        </ReportSection>

        <ReportSection title={r.sections.config}>
          <KV
            rows={[
              [l.storage, `${fmt.number(result.sizeMWh, 1)} MWh`],
              [l.dailyThermal, `${fmt.number(result.dailyThermalMWh, 1)} MWh`],
              [l.chargePower, `${fmt.number(result.chargePowerKW)} kW`],
              [l.dischargePower, `${fmt.number(result.dischargePowerKW)} kW`],
              [
                l.chargeWindow,
                l.chargeWindowValue(ASSUMPTIONS.chargeDurationHours),
              ],
              [
                l.efficiency,
                `${Math.round(ASSUMPTIONS.roundTripEfficiency * 100)} %`,
              ],
            ]}
          />
        </ReportSection>

        <ReportSection title={r.sections.financial}>
          <KV
            rows={[
              [l.fuelSavings, fmt.currency(result.fuelSavings)],
              [l.demandSavings, fmt.currency(result.demandSavings)],
              [l.totalSavings, fmt.currency(result.totalSavings)],
              [l.capex, fmt.currency(result.capex)],
              [l.subsidy, `−${fmt.currency(result.subsidy)}`],
              [l.netCapex, fmt.currency(result.netCapex)],
              [l.payback, fmt.years(result.paybackYears)],
              [
                l.energyShifted,
                r.perYearMwh(fmt.number(result.energyShiftedMWh)),
              ],
            ]}
          />
        </ReportSection>

        <ReportSection title={r.sections.emissions}>
          <KV
            rows={[
              [l.co2Before, r.perYearT(fmt.number(result.co2BeforeTonnes))],
              [l.co2After, r.perYearT(fmt.number(result.co2AfterTonnes))],
              [
                l.co2Reduction,
                r.perYearT(fmt.number(result.co2ReductionTonnes)),
              ],
              [
                l.reductionVs,
                result.co2BeforeTonnes > 0
                  ? `${Math.round((result.co2ReductionTonnes / result.co2BeforeTonnes) * 100)} %`
                  : "—",
              ],
            ]}
          />
        </ReportSection>

        <ReportSection title={r.sections.narrative}>
          <div className="space-y-3">
            {narrative.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-txt-2">
                {p}
              </p>
            ))}
          </div>
        </ReportSection>

        <ReportSection title={r.sections.next}>
          <ol className="space-y-2.5">
            {r.nextSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-txt-2">
                <span className="font-semibold text-accent-bright">
                  {i + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>
        </ReportSection>
      </div>
    </article>
  );
}
