const cad = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

const num = new Intl.NumberFormat("en-CA", { maximumFractionDigits: 0 });

/** $1,234,567 → "$1.23M"; keeps full form below 10k. */
export function fmtCurrencyCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return cad.format(value);
}

export function fmtCurrency(value: number): string {
  return cad.format(value);
}

export function fmtNumber(value: number, decimals = 0): string {
  if (decimals === 0) return num.format(Math.round(value));
  return new Intl.NumberFormat("en-CA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function fmtYears(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(1)} yrs`;
}

export function fmtHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}
