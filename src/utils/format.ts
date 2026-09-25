/**
 * Small formatting helpers reused across the app.
 * Keeping them isolated makes them easy to test and tweak.
 */
import { currentLocale } from "../i18n";

/**
 * Formats a price in euros for the current language.
 *
 * @example formatPrice(1240) → "€1,240" (English) or "1240 €" (Spanish)
 */
export function formatPrice(value: number): string {
  return value.toLocaleString(currentLocale(), {
    style: "currency",
    currency: "EUR",
    // Whole prices show no decimals, others show up to 2.
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
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
