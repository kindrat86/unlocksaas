/**
 * Number-formatting helpers for the /tools/* calculators.
 *
 * Centralised so every calculator renders dollars, months, and ratios
 * the same way. `Intl.NumberFormat` instances are hoisted to module
 * scope (`server-hoist-static-io` pattern) – constructing them once
 * is materially cheaper than reconstructing on every render.
 *
 * All formatters render in en-US (the canonical UnlockSaaS locale).
 * Operator-facing surfaces follow the Athens-timezone display rule
 * elsewhere; the calculators are public-marketing surfaces and stay
 * in the canonical en-US shape regardless of viewer locale.
 */

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const USD_CENTS = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const NUMBER_ONE_DP = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const NUMBER_INTEGER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

/**
 * Currency formatter. Switches to cents only when the magnitude is
 * small enough that the integer rounding would erase the answer
 * (e.g. $0.49 of monthly profit on a 1 percent margin).
 */
export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "–";
  if (Math.abs(value) > 0 && Math.abs(value) < 10) {
    return USD_CENTS.format(value);
  }
  return USD.format(value);
}

/** Generic number formatter with explicit fraction-digit control. */
export function formatNumber(value: number, fractionDigits = 0): string {
  if (!Number.isFinite(value)) return "–";
  if (fractionDigits >= 1) return NUMBER_ONE_DP.format(value);
  return NUMBER_INTEGER.format(value);
}

/**
 * Months formatter. Renders "1.2 months" / "14 months" – never
 * floors to integer months because the calculator is most useful at
 * the boundaries (11 vs 12, 17 vs 18) where the half-month matters.
 */
export function formatMonths(value: number): string {
  if (!Number.isFinite(value)) return "–";
  const rounded = NUMBER_ONE_DP.format(value);
  return `${rounded} ${value === 1 ? "month" : "months"}`;
}

/** Ratio formatter for LTV-to-CAC – always rendered as "N.N : 1". */
export function formatRatio(value: number): string {
  if (!Number.isFinite(value)) return "–";
  return `${NUMBER_ONE_DP.format(value)} : 1`;
}
