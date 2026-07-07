"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import BusinessCaseReport from "@/components/BusinessCaseReport";
import PlantIntakeForm from "@/components/PlantIntakeForm";
import SimulationDashboard from "@/components/SimulationDashboard";
import { runSimulation } from "@/lib/calculations";
import { DEFAULT_PLANT_INPUT } from "@/lib/defaults";
import type { PlantInput } from "@/types/plant";

const PlantTwin3D = dynamic(() => import("@/components/PlantTwin3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[440px] items-center justify-center rounded-2xl border border-edge bg-card text-sm text-txt-2 sm:h-[520px]">
      Loading plant twin…
    </div>
  ),
});

type Step = "intake" | "twin" | "simulation" | "report";

const STEPS: { id: Step; n: number; label: string }[] = [
  { id: "intake", n: 1, label: "Plant intake" },
  { id: "twin", n: 2, label: "Plant twin" },
  { id: "simulation", n: 3, label: "Simulation" },
  { id: "report", n: 4, label: "Report" },
];

export default function StudioPage() {
  const [input, setInput] = useState<PlantInput>(DEFAULT_PLANT_INPUT);
  const [step, setStepState] = useState<Step>("intake");
  const [assessed, setAssessed] = useState(false);

  const setStep = (s: Step) => {
    setStepState(s);
    window.scrollTo({ top: 0 });
  };

  const result = useMemo(() => runSimulation(input), [input]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const next = STEPS[stepIndex + 1];
  const canVisit = (s: Step) => assessed || s === "intake";

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Step navigation */}
      <nav aria-label="Assessment steps" className="mb-9">
        <ol className="flex flex-wrap items-center gap-2">
          {STEPS.map((s, i) => {
            const active = s.id === step;
            const enabled = canVisit(s.id);
            return (
              <li key={s.id} className="flex items-center gap-2">
                {i > 0 ? (
                  <span aria-hidden className="h-px w-6 bg-edge sm:w-10" />
                ) : null}
                <button
                  type="button"
                  disabled={!enabled}
                  onClick={() => setStep(s.id)}
                  aria-current={active ? "step" : undefined}
                  className={`flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-accent bg-accent/10 text-txt"
                      : enabled
                        ? "border-edge bg-card text-txt-2 hover:border-txt-3 hover:text-txt"
                        : "cursor-not-allowed border-edge/60 bg-transparent text-txt-3"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                      active ? "bg-accent text-white" : "bg-card-2 text-txt-2"
                    }`}
                  >
                    {s.n}
                  </span>
                  {s.label}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {step === "intake" ? (
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight">
            Plant intake
          </h1>
          <p className="mt-2 mb-8 text-sm leading-relaxed text-txt-2">
            Describe the facility and its thermal process. Everything can be
            adjusted later — the twin and business case update instantly.
          </p>
          <PlantIntakeForm
            value={input}
            onChange={setInput}
            onSubmit={() => {
              setAssessed(true);
              setStep("twin");
            }}
          />
        </div>
      ) : null}

      {step === "twin" ? (
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Plant twin — {input.name}
          </h1>
          <p className="mt-2 mb-8 text-sm leading-relaxed text-txt-2">
            TESSA charges from the grid off-peak, recovers process waste heat,
            and delivers stored heat to the process on demand.
          </p>
          <PlantTwin3D input={input} result={result} />
        </div>
      ) : null}

      {step === "simulation" ? (
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Simulation — {input.name}
          </h1>
          <p className="mt-2 mb-8 text-sm leading-relaxed text-txt-2">
            Recommended sizing and business case based on the intake profile.
          </p>
          <SimulationDashboard input={input} result={result} />
        </div>
      ) : null}

      {step === "report" ? (
        <div className="mx-auto max-w-4xl">
          <BusinessCaseReport input={input} result={result} />
        </div>
      ) : null}

      {/* Forward navigation */}
      {step !== "intake" && next ? (
        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={() => setStep(next.id)}
            className="rounded-xl bg-accent px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-colors hover:bg-accent-bright"
          >
            Continue to {next.label.toLowerCase()} →
          </button>
        </div>
      ) : null}
      {step === "report" ? (
        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={() => setStep("intake")}
            className="rounded-xl border border-edge bg-card px-7 py-3 text-sm font-semibold text-txt-2 transition-colors hover:border-txt-3 hover:text-txt"
          >
            ← Adjust plant inputs
          </button>
        </div>
      ) : null}
    </div>
  );
}
