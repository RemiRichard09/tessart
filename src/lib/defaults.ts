import type {
  HeatSource,
  IndustryType,
  PlantInput,
  ThermalProcess,
} from "@/types/plant";

/** Engineering & financial assumptions used by the simulation. */
export const ASSUMPTIONS = {
  /** TESSA usable temperature window, °C */
  tessaTempMinC: 100,
  tessaTempMaxC: 500,
  /** Installed storage cost, CAD per MWh of capacity */
  storageCostPerMWh: 150_000,
  /** Hydro-Québec incentive, CAD per MWh of capacity */
  subsidyPerMWh: 55_000,
  /** Subsidy cap as a fraction of gross CAPEX */
  maxSubsidyShare: 0.75,
  /** Round-trip thermal efficiency */
  roundTripEfficiency: 0.9,
  /** Recommended storage size = daily thermal demand × this factor */
  sizingFactor: 0.5,
  /** Charge window, hours (off-peak) */
  chargeDurationHours: 12,
  /** Peak reduction cap as a fraction of peak electrical demand */
  peakReductionShare: 0.3,
  /** Québec grid emission factor, kg CO2 per MWh */
  gridCo2KgPerMWh: 1.7,
} as const;

// Display labels live in lib/dictionaries.ts (t.options.*).
export const INDUSTRY_OPTIONS: IndustryType[] = [
  "asphalt",
  "food-processing",
  "sawmill",
  "mining",
  "aluminum",
  "pulp-and-paper",
  "greenhouse",
  "other",
];

export const HEAT_SOURCE_OPTIONS: HeatSource[] = [
  "natural-gas",
  "propane",
  "electricity",
  "biomass",
  "waste-heat",
  "mixed",
];

export const PROCESS_OPTIONS: ThermalProcess[] = [
  "dryer",
  "oven",
  "boiler",
  "air-make-up",
  "thermal-oil-loop",
  "steam",
  "furnace",
  "other",
];

/** Pre-filled demo plant so the flow can be walked end-to-end immediately. */
export const DEFAULT_PLANT_INPUT: PlantInput = {
  name: "Boreal Asphalt — Plant 07",
  industry: "asphalt",
  heatSource: "propane",
  process: "dryer",
  processTempC: 160,
  annualEnergyMWh: 12_000,
  peakDemandKW: 4_800,
  availableCapacityKW: 6_000,
  operatingHoursPerDay: 16,
  operatingDaysPerYear: 300,
  electricityRatePerMWh: 52,
  demandChargePerKWMonth: 16.5,
  fuelCostPerMWh: 95,
  co2FactorKgPerMWh: 215,
};

