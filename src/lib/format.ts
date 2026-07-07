import type { Lang } from "@/lib/dictionaries";

export interface Formatters {
  /** $1,234,567 → "$1.23M" / "1,23 M$"; keeps full form below 10k. */
  currencyCompact: (value: number) => string;
  currency: (value: number) => string;
  number: (value: number, decimals?: number) => string;
  years: (value: number) => string;
  hour: (hour: number) => string;
  date: (date: Date) => string;
}

export function makeFormatters(lang: Lang): Formatters {
  const locale = lang === "fr" ? "fr-CA" : "en-CA";
  const cad = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  });
  const int = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

  const number = (value: number, decimals = 0) =>
    decimals === 0
      ? int.format(Math.round(value))
      : new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);

  const currencyCompact = (value: number) => {
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (lang === "fr") {
      if (abs >= 1_000_000) return `${sign}${number(abs / 1_000_000, 2)} M$`;
      if (abs >= 10_000) return `${sign}${number(abs / 1_000)} k$`;
    } else {
      if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
      if (abs >= 10_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
    }
    return cad.format(value);
  };

  return {
    currencyCompact,
    currency: (value) => cad.format(value),
    number,
    years: (value) => {
      if (!Number.isFinite(value)) return "—";
      return lang === "fr" ? `${number(value, 1)} ans` : `${value.toFixed(1)} yrs`;
    },
    hour: (hour) => `${String(hour).padStart(2, "0")}:00`,
    date: (date) =>
      date.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
  };
}
