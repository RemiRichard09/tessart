"use client";

import { useId } from "react";
import {
  HEAT_SOURCE_OPTIONS,
  INDUSTRY_OPTIONS,
  PROCESS_OPTIONS,
} from "@/lib/defaults";
import type { PlantInput } from "@/types/plant";

interface Props {
  value: PlantInput;
  onChange: (value: PlantInput) => void;
  onSubmit: () => void;
}

const inputClass =
  "w-full rounded-lg border border-edge bg-navy-900 px-3.5 py-2.5 text-sm text-txt " +
  "placeholder:text-txt-3 focus:border-volt focus:outline-none focus:ring-1 focus:ring-volt/50";

function Field({
  label,
  unit,
  children,
}: {
  label: string;
  unit?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-txt-2">
        {label}
        {unit ? <span className="text-xs text-txt-3">{unit}</span> : null}
      </span>
      {children}
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-edge bg-card p-6">
      <legend className="sr-only">{title}</legend>
      <h3 className="mb-5 text-xs font-semibold tracking-widest text-txt-3 uppercase">
        {title}
      </h3>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export default function PlantIntakeForm({ value, onChange, onSubmit }: Props) {
  const formId = useId();

  const set = <K extends keyof PlantInput>(key: K, v: PlantInput[K]) =>
    onChange({ ...value, [key]: v });

  const setNum =
    (key: keyof PlantInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
      set(key, Number(e.target.value) as never);

  return (
    <form
      id={formId}
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Section title="Plant identity">
        <Field label="Plant name">
          <input
            className={inputClass}
            value={value.name}
            required
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Boreal Asphalt — Plant 07"
          />
        </Field>
        <Field label="Industry type">
          <select
            className={inputClass}
            value={value.industry}
            onChange={(e) => set("industry", e.target.value as never)}
          >
            {INDUSTRY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </Section>

      <Section title="Thermal process">
        <Field label="Current heat source">
          <select
            className={inputClass}
            value={value.heatSource}
            onChange={(e) => set("heatSource", e.target.value as never)}
          >
            {HEAT_SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Main thermal process">
          <select
            className={inputClass}
            value={value.process}
            onChange={(e) => set("process", e.target.value as never)}
          >
            {PROCESS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Process temperature" unit="°C">
          <input
            type="number"
            className={inputClass}
            value={value.processTempC}
            min={0}
            required
            onChange={setNum("processTempC")}
          />
        </Field>
      </Section>

      <Section title="Energy & operations">
        <Field label="Annual energy consumption" unit="MWh / year">
          <input
            type="number"
            className={inputClass}
            value={value.annualEnergyMWh}
            min={1}
            required
            onChange={setNum("annualEnergyMWh")}
          />
        </Field>
        <Field label="Peak electrical demand" unit="kW">
          <input
            type="number"
            className={inputClass}
            value={value.peakDemandKW}
            min={0}
            required
            onChange={setNum("peakDemandKW")}
          />
        </Field>
        <Field label="Available electrical capacity" unit="kW">
          <input
            type="number"
            className={inputClass}
            value={value.availableCapacityKW}
            min={0}
            required
            onChange={setNum("availableCapacityKW")}
          />
        </Field>
        <Field label="Operating hours per day" unit="h / day">
          <input
            type="number"
            className={inputClass}
            value={value.operatingHoursPerDay}
            min={1}
            max={24}
            required
            onChange={setNum("operatingHoursPerDay")}
          />
        </Field>
        <Field label="Operating days per year" unit="days / year">
          <input
            type="number"
            className={inputClass}
            value={value.operatingDaysPerYear}
            min={1}
            max={365}
            required
            onChange={setNum("operatingDaysPerYear")}
          />
        </Field>
      </Section>

      <Section title="Tariffs & emissions">
        <Field label="Electricity rate" unit="$ / MWh">
          <input
            type="number"
            className={inputClass}
            value={value.electricityRatePerMWh}
            min={0}
            step="0.01"
            required
            onChange={setNum("electricityRatePerMWh")}
          />
        </Field>
        <Field label="Peak demand charge" unit="$ / kW / month">
          <input
            type="number"
            className={inputClass}
            value={value.demandChargePerKWMonth}
            min={0}
            step="0.01"
            required
            onChange={setNum("demandChargePerKWMonth")}
          />
        </Field>
        <Field label="Fuel cost" unit="$ / MWh">
          <input
            type="number"
            className={inputClass}
            value={value.fuelCostPerMWh}
            min={0}
            step="0.01"
            required
            onChange={setNum("fuelCostPerMWh")}
          />
        </Field>
        <Field label="CO₂ factor" unit="kg / MWh">
          <input
            type="number"
            className={inputClass}
            value={value.co2FactorKgPerMWh}
            min={0}
            step="0.1"
            required
            onChange={setNum("co2FactorKgPerMWh")}
          />
        </Field>
      </Section>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          className="rounded-xl bg-accent px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-colors hover:bg-accent-bright"
        >
          Generate digital twin →
        </button>
      </div>
    </form>
  );
}
