"use client";

import { useState } from "react";
import {
  ASSUMPTIONS,
  HEAT_SOURCE_OPTIONS,
  INDUSTRY_OPTIONS,
  labelFor,
  PROCESS_OPTIONS,
} from "@/lib/defaults";
import {
  fmtCurrency,
  fmtNumber,
  fmtYears,
} from "@/lib/format";
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

function integrationNarrative(input: PlantInput, result: SimulationResult) {
  const process = labelFor(PROCESS_OPTIONS, input.process).toLowerCase();
  const heat = labelFor(HEAT_SOURCE_OPTIONS, input.heatSource).toLowerCase();
  const { tessaTempMinC, tessaTempMaxC } = ASSUMPTIONS;

  const tempFit =
    input.processTempC > tessaTempMaxC
      ? `The ${process} runs at ${fmtNumber(input.processTempC)} °C, above TESSA's ${tessaTempMaxC} °C delivery ceiling, so TESSA would preheat the process stream and the existing ${heat} system would provide the final temperature lift.`
      : input.processTempC < tessaTempMinC
        ? `The ${process} runs at ${fmtNumber(input.processTempC)} °C, below TESSA's ${tessaTempMinC}–${tessaTempMaxC} °C window, so delivery would be tempered down through the existing distribution loop.`
        : `The ${process} runs at ${fmtNumber(input.processTempC)} °C, comfortably inside TESSA's ${tessaTempMinC}–${tessaTempMaxC} °C delivery window, allowing direct substitution of ${heat} heat.`;

  return [
    `TESSA is installed beside the ${process} and charges from the grid during the ${ASSUMPTIONS.chargeDurationHours}-hour off-peak window at up to ${fmtNumber(result.chargePowerKW)} kW, within the plant's ${fmtNumber(input.availableCapacityKW)} kW of available electrical capacity.`,
    tempFit,
    `Across the ${fmtNumber(input.operatingHoursPerDay)}-hour production shift, TESSA discharges up to ${fmtNumber(result.dischargePowerKW)} kW of heat into the process, shaving an estimated ${fmtNumber(result.peakReductionKW)} kW off the plant's electrical peak. Recoverable waste heat from the process exhaust is captured back into the store, supporting the ${Math.round(ASSUMPTIONS.roundTripEfficiency * 100)}% round-trip thermal efficiency assumed here.`,
  ];
}

const NEXT_STEPS = [
  "Site walk-through to confirm TESSA placement, tie-in points, and electrical room capacity.",
  "Collect 12 months of interval billing data to refine the load model and demand-charge baseline.",
  "Validate the Hydro-Québec incentive envelope and file the pre-application.",
  "Front-end engineering study: heat exchanger sizing, controls integration, and waste-heat recovery ducting.",
  "Commercial proposal with a firm CAPEX quote and installation schedule.",
];

export default function BusinessCaseReport({ input, result }: Props) {
  const [exportNote, setExportNote] = useState(false);

  return (
    <article className="rounded-2xl border border-edge bg-card">
      {/* Report header */}
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-t-2xl bg-gradient-to-br from-card-2 to-card px-8 py-7">
        <div>
          <p className="text-xs font-semibold tracking-widest text-txt-3 uppercase">
            Business case report
          </p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight">
            {input.name}
          </h2>
          <p className="mt-1 text-sm text-txt-2">
            TESSA thermal battery pre-feasibility ·{" "}
            {new Date().toLocaleDateString("en-CA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={() => setExportNote(true)}
            className="rounded-lg border border-edge bg-navy-900 px-4 py-2 text-sm font-semibold text-txt transition-colors hover:border-txt-3"
          >
            Export PDF
          </button>
          {exportNote ? (
            <p className="text-xs text-txt-3">PDF export coming soon</p>
          ) : null}
        </div>
      </header>

      <div className="px-8 pb-4">
        <ReportSection title="Plant summary">
          <KV
            rows={[
              ["Industry", labelFor(INDUSTRY_OPTIONS, input.industry)],
              ["Main thermal process", labelFor(PROCESS_OPTIONS, input.process)],
              ["Current heat source", labelFor(HEAT_SOURCE_OPTIONS, input.heatSource)],
              ["Process temperature", `${fmtNumber(input.processTempC)} °C`],
              ["Annual energy consumption", `${fmtNumber(input.annualEnergyMWh)} MWh`],
              ["Peak electrical demand", `${fmtNumber(input.peakDemandKW)} kW`],
              ["Available electrical capacity", `${fmtNumber(input.availableCapacityKW)} kW`],
              [
                "Operating schedule",
                `${fmtNumber(input.operatingHoursPerDay)} h/day · ${fmtNumber(input.operatingDaysPerYear)} days/yr`,
              ],
            ]}
          />
        </ReportSection>

        <ReportSection title="Recommended TESSA configuration">
          <KV
            rows={[
              ["Storage capacity", `${fmtNumber(result.sizeMWh, 1)} MWh`],
              ["Daily thermal demand", `${fmtNumber(result.dailyThermalMWh, 1)} MWh`],
              ["Charge power (electrical)", `${fmtNumber(result.chargePowerKW)} kW`],
              ["Discharge power (thermal)", `${fmtNumber(result.dischargePowerKW)} kW`],
              ["Charge window", `${ASSUMPTIONS.chargeDurationHours} h off-peak`],
              [
                "Round-trip thermal efficiency",
                `${Math.round(ASSUMPTIONS.roundTripEfficiency * 100)}%`,
              ],
            ]}
          />
        </ReportSection>

        <ReportSection title="Financial impact">
          <KV
            rows={[
              ["Annual fuel savings", fmtCurrency(result.fuelSavings)],
              ["Annual demand savings", fmtCurrency(result.demandSavings)],
              ["Total annual savings", fmtCurrency(result.totalSavings)],
              ["Estimated CAPEX", fmtCurrency(result.capex)],
              ["Subsidy estimate (Hydro-Québec)", `−${fmtCurrency(result.subsidy)}`],
              ["Net CAPEX", fmtCurrency(result.netCapex)],
              ["Simple payback", fmtYears(result.paybackYears)],
              [
                "Energy shifted to off-peak",
                `${fmtNumber(result.energyShiftedMWh)} MWh/yr`,
              ],
            ]}
          />
        </ReportSection>

        <ReportSection title="Emissions impact">
          <KV
            rows={[
              ["CO₂ before TESSA", `${fmtNumber(result.co2BeforeTonnes)} t/yr`],
              ["CO₂ after TESSA", `${fmtNumber(result.co2AfterTonnes)} t/yr`],
              ["Annual CO₂ reduction", `${fmtNumber(result.co2ReductionTonnes)} t/yr`],
              [
                "Reduction vs baseline",
                result.co2BeforeTonnes > 0
                  ? `${Math.round((result.co2ReductionTonnes / result.co2BeforeTonnes) * 100)}%`
                  : "—",
              ],
            ]}
          />
        </ReportSection>

        <ReportSection title="Integration narrative">
          <div className="space-y-3">
            {integrationNarrative(input, result).map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-txt-2">
                {p}
              </p>
            ))}
          </div>
        </ReportSection>

        <ReportSection title="Next steps">
          <ol className="space-y-2.5">
            {NEXT_STEPS.map((step, i) => (
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
