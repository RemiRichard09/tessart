import { ASSUMPTIONS } from "@/lib/defaults";
import type {
  LoadCurvePoint,
  PlantInput,
  SimulationResult,
  SocPoint,
} from "@/types/plant";

const HOURS = Array.from({ length: 24 }, (_, h) => h);

/** Hour at which the plant starts its daily operating window. */
const OPERATING_START_HOUR = 6;
/** Hour at which the overnight charge window starts. */
const CHARGE_START_HOUR = 20;

export function runSimulation(input: PlantInput): SimulationResult {
  const a = ASSUMPTIONS;
  const operatingDays = Math.max(1, input.operatingDaysPerYear);
  const operatingHours = clamp(input.operatingHoursPerDay, 1, 24);

  const dailyThermalMWh = input.annualEnergyMWh / operatingDays;
  const sizeMWh = dailyThermalMWh * a.sizingFactor;

  // Electrical input needed to fill the store in the charge window,
  // accounting for round-trip losses, limited by spare grid capacity.
  const uncappedChargeKW =
    (sizeMWh / a.roundTripEfficiency / a.chargeDurationHours) * 1000;
  const chargePowerKW = Math.min(
    uncappedChargeKW,
    Math.max(0, input.availableCapacityKW),
  );

  const dischargePowerKW = (sizeMWh * 1000) / operatingHours;
  const peakReductionKW = Math.min(
    dischargePowerKW,
    input.peakDemandKW * a.peakReductionShare,
  );

  // One full cycle per operating day, never more than the plant consumes.
  const energyShiftedMWh = Math.min(
    sizeMWh * operatingDays,
    input.annualEnergyMWh,
  );
  const chargeElectricityMWh = energyShiftedMWh / a.roundTripEfficiency;

  // Displaced fuel purchases net of the off-peak electricity used to charge.
  const fuelSavings =
    energyShiftedMWh * input.fuelCostPerMWh -
    chargeElectricityMWh * input.electricityRatePerMWh;
  const demandSavings = peakReductionKW * input.demandChargePerKWMonth * 12;
  const totalSavings = fuelSavings + demandSavings;

  const co2BeforeTonnes = (input.annualEnergyMWh * input.co2FactorKgPerMWh) / 1000;
  const co2ReductionTonnes = Math.max(
    0,
    (energyShiftedMWh * input.co2FactorKgPerMWh -
      chargeElectricityMWh * a.gridCo2KgPerMWh) /
      1000,
  );
  const co2AfterTonnes = Math.max(0, co2BeforeTonnes - co2ReductionTonnes);

  const capex = sizeMWh * a.storageCostPerMWh;
  const subsidy = Math.min(sizeMWh * a.subsidyPerMWh, capex * a.maxSubsidyShare);
  const netCapex = capex - subsidy;
  const paybackYears = totalSavings > 0 ? netCapex / totalSavings : Infinity;

  return {
    dailyThermalMWh,
    sizeMWh,
    chargePowerKW,
    dischargePowerKW,
    peakReductionKW,
    energyShiftedMWh,
    chargeElectricityMWh,
    fuelSavings,
    demandSavings,
    totalSavings,
    co2BeforeTonnes,
    co2AfterTonnes,
    co2ReductionTonnes,
    capex,
    subsidy,
    netCapex,
    paybackYears,
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function isOperatingHour(hour: number, operatingHours: number): boolean {
  const end = OPERATING_START_HOUR + clamp(operatingHours, 1, 24);
  return (
    (hour >= OPERATING_START_HOUR && hour < end) || hour + 24 < end
  );
}

function isChargeHour(hour: number): boolean {
  const end = CHARGE_START_HOUR + ASSUMPTIONS.chargeDurationHours;
  return hour >= CHARGE_START_HOUR || hour + 24 < end;
}

/** Smooth production profile: ramps up, peaks mid-shift, tapers off. */
function operatingProfile(hour: number, operatingHours: number): number {
  const span = clamp(operatingHours, 1, 24);
  const t = ((hour - OPERATING_START_HOUR + 24) % 24) / span;
  if (t < 0 || t >= 1) return 0;
  return 0.72 + 0.28 * Math.sin(Math.PI * t);
}

/**
 * Illustrative 24-hour electrical load, before and after TESSA:
 * the daytime peak is shaved by TESSA discharge while the overnight
 * valley is filled by off-peak charging.
 */
export function buildLoadCurve(
  input: PlantInput,
  result: SimulationResult,
): LoadCurvePoint[] {
  const baseLoad = input.peakDemandKW * 0.3;

  return HOURS.map((hour) => {
    const operating = isOperatingHour(hour, input.operatingHoursPerDay);
    const before = operating
      ? input.peakDemandKW * operatingProfile(hour, input.operatingHoursPerDay)
      : baseLoad;

    let after = before;
    if (operating) after -= result.peakReductionKW;
    if (isChargeHour(hour)) after += result.chargePowerKW;

    return {
      hour,
      before: Math.round(Math.max(0, before)),
      after: Math.round(Math.max(0, after)),
    };
  });
}

/**
 * TESSA state of charge over 24 hours: fills during the overnight
 * charge window, drains across the operating shift.
 */
export function buildSocCurve(
  input: PlantInput,
  result: SimulationResult,
): SocPoint[] {
  const size = result.sizeMWh;
  if (size <= 0) {
    return HOURS.map((hour) => ({ hour, socPct: 0, socMWh: 0 }));
  }

  const chargePerHour = size / ASSUMPTIONS.chargeDurationHours;
  const dischargePerHour = size / clamp(input.operatingHoursPerDay, 1, 24);

  // Net energy flow per hour; totals cancel over a full day.
  const cumulative: number[] = [];
  let level = 0;
  for (const hour of HOURS) {
    if (isChargeHour(hour)) level += chargePerHour;
    if (isOperatingHour(hour, input.operatingHoursPerDay)) {
      level -= dischargePerHour;
    }
    cumulative.push(level);
  }
  // Shift so the daily minimum sits at zero (empty store).
  const min = Math.min(0, ...cumulative);

  return HOURS.map((hour, i) => {
    const socMWh = clamp(cumulative[i] - min, 0, size);
    return {
      hour,
      socMWh: Math.round(socMWh * 10) / 10,
      socPct: Math.round((socMWh / size) * 100),
    };
  });
}
