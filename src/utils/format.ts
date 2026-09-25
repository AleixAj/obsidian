/**
 * Small formatting helpers reused across the app.
 * Keeping them isolated makes them easy to test and tweak.
 */
import { currentLocale } from "../i18n";

/**
 * Formats a price in euros for the current language.
 *
 * @example formatPrice(1240) → "€1,240" (English) or "1240 €" (Spanish)
 * @example formatPrice(49.9) → "€49.90"
 */
export function formatPrice(value: number): string {
  // Round to cents first, so float noise (49.99 * 3) doesn't show.
  const rounded = Math.round(value * 100) / 100;
  // Whole prices show no decimals, the rest always show 2 (€49.90).
  const decimals = Number.isInteger(rounded) ? 0 : 2;

  return rounded.toLocaleString(currentLocale(), {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Pads a number with a leading zero — used by the countdown.
 *
 * @example pad(7) → "07"
 */
export function pad(n: number): string {
  return String(n).padStart(2, "0");
}
