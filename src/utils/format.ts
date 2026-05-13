/**
 * Small formatting helpers reused across the app.
 * Keeping them isolated makes them easy to test and tweak
 * (eg. swap locale, currency).
 */

/**
 * Formats a numeric price in euros using the EU separator convention.
 *
 * @example formatPrice(1240) → "€1,240"
 */
export function formatPrice(value: number): string {
  return "€" + value.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

/**
 * Pads a number with a leading zero — used by the countdown.
 *
 * @example pad(7) → "07"
 */
export function pad(n: number): string {
  return String(n).padStart(2, "0");
}
