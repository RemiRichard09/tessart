export type IndustryType =
  | "asphalt"
  | "food-processing"
  | "sawmill"
  | "mining"
  | "aluminum"
  | "pulp-and-paper"
  | "greenhouse"
  | "other";

export type HeatSource =
  | "natural-gas"
  | "propane"
  | "electricity"
  | "biomass"
  | "waste-heat"
  | "mixed";

export type ThermalProcess =
  | "dryer"
  | "oven"
  | "boiler"
  | "air-make-up"
  | "thermal-oil-loop"
  | "steam"
  | "furnace"
  | "other";

export interface PlantInput {
  name: string;
  industry: IndustryType;
  heatSource: HeatSource;
  process: ThermalProcess;
  processTempC: number;
  annualEnergyMWh: number;
  peakDemandKW: number;
  availableCapacityKW: number;
  operatingHoursPerDay: number;
  operatingDaysPerYear: number;
  electricityRatePerMWh: number;
  demandChargePerKWMonth: number;
  fuelCostPerMWh: number;
  co2FactorKgPerMWh: number;
}

export interface SimulationResult {
  /** Daily thermal demand, MWh */
  dailyThermalMWh: number;
  /** Recommended TESSA storage size, MWh */
  sizeMWh: number;
  /** Electrical charge power, kW */
  chargePowerKW: number;
  /** Thermal discharge power, kW */
  dischargePowerKW: number;
  /** Estimated peak demand reduction, kW */
  peakReductionKW: number;
  /** Annual thermal energy shifted to TESSA, MWh */
  energyShiftedMWh: number;
  /** Annual electricity drawn to charge TESSA, MWh */
  chargeElectricityMWh: number;
  /** Annual fuel savings, CAD */
  fuelSavings: number;
  /** Annual demand-charge savings, CAD */
  demandSavings: number;
  /** Total annual savings, CAD */
  totalSavings: number;
  /** Annual CO2 emissions before TESSA, tonnes */
  co2BeforeTonnes: number;
  /** Annual CO2 emissions after TESSA, tonnes */
  co2AfterTonnes: number;
  /** Annual CO2 reduction, tonnes */
  co2ReductionTonnes: number;
  /** Gross CAPEX, CAD */
  capex: number;
  /** Estimated subsidy, CAD */
  subsidy: number;
  /** Net CAPEX after subsidy, CAD */
  netCapex: number;
  /** Simple payback, years (Infinity when savings <= 0) */
  paybackYears: number;
}

export interface LoadCurvePoint {
  hour: number;
  before: number;
  after: number;
}

export interface SocPoint {
  hour: number;
  socPct: number;
  socMWh: number;
}
