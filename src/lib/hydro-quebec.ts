/**
 * Hydro-Québec bill parsing and savings calculation for thermal accumulators.
 *
 * Rate structures (2024-2025):
 * - Rate D (residential): 7.59¢/kWh (first 40 kWh/day), then 10.34¢/kWh
 * - Flex D: base rate + credits/surcharges for peak events
 *   - Off-peak: base rate with potential 50% credit during winter events
 *   - Peak (winter events, ~100h/year): surcharge up to 50¢/kWh
 *
 * Thermal accumulators shift heating consumption to off-peak hours,
 * avoiding peak surcharges and earning off-peak credits under Flex D.
 */

export interface BillData {
  /** Period start date */
  periodStart: string;
  /** Period end date */
  periodEnd: string;
  /** Number of days in billing period */
  days: number;
  /** Total consumption in kWh */
  totalKwh: number;
  /** Total bill amount before taxes in $ */
  amountBeforeTax: number;
  /** Total bill amount after taxes in $ */
  amountAfterTax: number;
  /** Average daily consumption in kWh */
  avgDailyKwh: number;
  /** Current rate type detected */
  rateType: "D" | "DM" | "Flex D" | "unknown";
}

export interface SavingsEstimate {
  /** Parsed bill data */
  bill: BillData;
  /** Estimated annual consumption in kWh */
  annualKwh: number;
  /** Estimated heating portion of consumption in kWh */
  heatingKwh: number;
  /** Current annual cost estimate */
  currentAnnualCost: number;
  /** Annual cost with thermal accumulator + Flex D */
  projectedAnnualCost: number;
  /** Annual savings in $ */
  annualSavings: number;
  /** Monthly average savings in $ */
  monthlySavings: number;
  /** Savings percentage */
  savingsPercent: number;
  /** Estimated payback period in years (based on typical accumulator cost) */
  paybackYears: number;
  /** Breakdown of savings sources */
  breakdown: {
    peakAvoidanceSavings: number;
    offPeakCreditSavings: number;
    rateOptimizationSavings: number;
  };
}

// Hydro-Québec Rate D thresholds (2024-2025)
const RATE_D_TIER1_PRICE = 0.0759; // $/kWh first 40 kWh/day
const RATE_D_TIER1_DAILY_LIMIT = 40; // kWh/day
const RATE_D_TIER2_PRICE = 0.1034; // $/kWh above 40 kWh/day

// Flex D parameters
const FLEX_D_BASE_RATE = 0.0759;
const FLEX_D_PEAK_SURCHARGE = 0.50; // $/kWh during peak events
const FLEX_D_OFFPEAK_CREDIT_RATE = 0.50; // 50% credit during off-peak winter events
const FLEX_D_PEAK_HOURS_PER_YEAR = 100; // ~100 hours of peak events per winter

// Thermal accumulator assumptions
const HEATING_PERCENT_OF_TOTAL = 0.60; // ~60% of residential consumption is heating in QC
const PEAK_HEATING_PERCENT = 0.35; // % of heating that falls during peak periods
const ACCUMULATOR_SHIFT_EFFICIENCY = 0.85; // 85% of peak heating can be shifted off-peak
const TYPICAL_ACCUMULATOR_COST = 5500; // $ installed cost for a residential unit

/**
 * Parse text extracted from a Hydro-Québec PDF bill.
 */
export function parseBillText(text: string): BillData {
  const normalized = text.replace(/\s+/g, " ").replace(/,/g, ".");

  // Try to extract consumption (kWh)
  const kwhPatterns = [
    /(\d[\d\s]*\d)\s*kWh/i,
    /consommation[^0-9]*(\d[\d\s.]*\d)\s*kWh/i,
    /total[^0-9]*(\d[\d\s.]*\d)\s*kWh/i,
    /(\d{3,6})\s*kWh/i,
  ];

  let totalKwh = 0;
  for (const pattern of kwhPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      totalKwh = parseFloat(match[1].replace(/\s/g, ""));
      if (totalKwh > 0) break;
    }
  }

  // Try to extract bill amount
  const amountPatterns = [
    /montant\s*(?:total|à payer|facturé)[^0-9]*(\d+\.?\d*)\s*\$/i,
    /total[^0-9]*(\d+\.?\d*)\s*\$/i,
    /(\d+\.\d{2})\s*\$/,
    /\$\s*(\d+\.\d{2})/,
  ];

  let amountAfterTax = 0;
  for (const pattern of amountPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      amountAfterTax = parseFloat(match[1]);
      if (amountAfterTax > 20) break; // Reasonable bill amount
    }
  }

  // Try to extract billing period dates
  const datePatterns = [
    /du\s+(\d{4}-\d{2}-\d{2})\s+au\s+(\d{4}-\d{2}-\d{2})/i,
    /du\s+(\d{1,2}\s+\w+\s+\d{4})\s+au\s+(\d{1,2}\s+\w+\s+\d{4})/i,
    /période[^0-9]*(\d{4}-\d{2}-\d{2})[^0-9]*(\d{4}-\d{2}-\d{2})/i,
  ];

  let periodStart = "";
  let periodEnd = "";
  for (const pattern of datePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      periodStart = match[1];
      periodEnd = match[2];
      break;
    }
  }

  // Try to extract number of days
  const daysPatterns = [
    /(\d+)\s*jours?/i,
    /période\s*de\s*(\d+)/i,
  ];

  let days = 0;
  for (const pattern of daysPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      days = parseInt(match[1]);
      if (days > 20 && days < 100) break;
    }
  }

  // Default to ~30 days if not found
  if (days === 0) days = 30;

  // Detect rate type
  let rateType: BillData["rateType"] = "unknown";
  if (/tarif\s*d\b|rate\s*d\b/i.test(normalized)) rateType = "D";
  if (/flex\s*d/i.test(normalized)) rateType = "Flex D";
  if (/tarif\s*dm|rate\s*dm/i.test(normalized)) rateType = "DM";

  const amountBeforeTax = amountAfterTax / 1.14975; // QST+GST
  const avgDailyKwh = totalKwh > 0 ? totalKwh / days : 0;

  return {
    periodStart,
    periodEnd,
    days,
    totalKwh,
    amountBeforeTax: Math.round(amountBeforeTax * 100) / 100,
    amountAfterTax,
    avgDailyKwh: Math.round(avgDailyKwh * 10) / 10,
    rateType,
  };
}

/**
 * Calculate the cost under Rate D for a given consumption.
 */
function calculateRateDCost(totalKwh: number, days: number): number {
  const tier1Kwh = Math.min(totalKwh, RATE_D_TIER1_DAILY_LIMIT * days);
  const tier2Kwh = Math.max(0, totalKwh - tier1Kwh);
  return tier1Kwh * RATE_D_TIER1_PRICE + tier2Kwh * RATE_D_TIER2_PRICE;
}

/**
 * Estimate annual savings from using a thermal accumulator with Flex D.
 */
export function calculateSavings(bill: BillData): SavingsEstimate {
  // Annualize from the billing period
  const annualFactor = 365 / bill.days;
  const annualKwh = Math.round(bill.totalKwh * annualFactor);

  // Estimate heating portion (higher in winter months)
  const heatingKwh = Math.round(annualKwh * HEATING_PERCENT_OF_TOTAL);

  // Current annual cost (Rate D if not specified)
  let currentAnnualCost: number;
  if (bill.amountBeforeTax > 0) {
    currentAnnualCost = bill.amountBeforeTax * annualFactor;
  } else {
    currentAnnualCost = calculateRateDCost(annualKwh, 365);
  }

  // --- Savings calculation ---

  // 1. Peak avoidance: heating kWh that would be at peak, shifted to off-peak
  const peakHeatingKwh = heatingKwh * PEAK_HEATING_PERCENT;
  const shiftedKwh = peakHeatingKwh * ACCUMULATOR_SHIFT_EFFICIENCY;
  // During peak events (~100h/year), the surcharge is 50¢/kWh
  // The shifted kWh avoid this surcharge
  const avgPeakKwhPerHour = shiftedKwh / (FLEX_D_PEAK_HOURS_PER_YEAR * 5); // spread over winter months
  const peakAvoidanceSavings =
    shiftedKwh * FLEX_D_PEAK_SURCHARGE * (FLEX_D_PEAK_HOURS_PER_YEAR / (24 * 150)); // ~150 heating days

  // 2. Off-peak credits: earn credits by reducing consumption during peak events
  const offPeakCreditSavings =
    shiftedKwh * FLEX_D_BASE_RATE * FLEX_D_OFFPEAK_CREDIT_RATE * 0.15;

  // 3. Rate optimization: moving more consumption to tier 1
  // By flattening demand curve, more consumption stays in the cheaper tier
  const currentTier2Kwh = Math.max(
    0,
    annualKwh - RATE_D_TIER1_DAILY_LIMIT * 365
  );
  const optimizedTier2Kwh = currentTier2Kwh * 0.7; // 30% reduction in tier 2
  const rateOptimizationSavings =
    (currentTier2Kwh - optimizedTier2Kwh) *
    (RATE_D_TIER2_PRICE - RATE_D_TIER1_PRICE);

  const annualSavings =
    peakAvoidanceSavings + offPeakCreditSavings + rateOptimizationSavings;

  const projectedAnnualCost = currentAnnualCost - annualSavings;
  const monthlySavings = annualSavings / 12;
  const savingsPercent = (annualSavings / currentAnnualCost) * 100;
  const paybackYears = TYPICAL_ACCUMULATOR_COST / annualSavings;

  return {
    bill,
    annualKwh,
    heatingKwh,
    currentAnnualCost: round2(currentAnnualCost),
    projectedAnnualCost: round2(projectedAnnualCost),
    annualSavings: round2(annualSavings),
    monthlySavings: round2(monthlySavings),
    savingsPercent: Math.round(savingsPercent * 10) / 10,
    paybackYears: Math.round(paybackYears * 10) / 10,
    breakdown: {
      peakAvoidanceSavings: round2(peakAvoidanceSavings),
      offPeakCreditSavings: round2(offPeakCreditSavings),
      rateOptimizationSavings: round2(rateOptimizationSavings),
    },
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
