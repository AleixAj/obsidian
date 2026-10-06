/**
 * Small helpers shared by the sections of the "My account" page:
 * member tiers, reward points and dates.
 */

import i18n, { currentLocale } from "../../i18n";
import type { Product } from "../../types";

export type ProductMap = Map<string, Product>;

export type Section = "overview" | "orders" | "wishlist" | "addresses" | "settings" | "rewards";
export const SECTIONS: Section[] = ["overview", "orders", "wishlist", "addresses", "settings", "rewards"];

/** 4999 → 49.99 (we keep the cents). */
export function euroFromCents(cents: number): number {
  return cents / 100;
}

/**
 * The member tiers, from the lowest. "from" is how much you must have spent (in euros).
 * The API decides the tier; the names are translated with t(`tiers.${key}`).
 */
export const TIERS = [
  { key: "silver", from: 0 },
  { key: "gold", from: 2000 },
  { key: "onyx", from: 7000 },
];

/** "Gold" (from the API) → the tier and the next one to reach (none at the top). */
export function tierInfo(apiTier: string) {
  const index = Math.max(0, TIERS.findIndex((tier) => tier.key === apiTier.toLowerCase()));
  return { key: TIERS[index].key, next: TIERS[index + 1] ?? null };
}

/** How close (0-100%) the member is to the next tier. Full bar at the top tier. */
export function progressTo(next: { from: number } | null, spend: number): number {
  if (!next) return 100;
  return Math.min(100, Math.round((spend / next.from) * 100));
}

/** 100 points = €2 of credit. */
export function creditFromPoints(points: number): number {
  return Math.floor(points / 100) * 2;
}

// These helpers live outside components, so they use i18n.t() directly
// instead of the useTranslation() hook.
const ORDER_STATUSES = ["pending", "paid", "preparing", "shipped", "delivered", "returned", "cancelled"];

export function statusLabel(status: string): string {
  return ORDER_STATUSES.includes(status) ? i18n.t(`status.${status}`, { ns: "account" }) : status;
}

export function formatDate(value: string | null): string {
  if (!value) return i18n.t("dates.pending", { ns: "account" });
  return new Intl.DateTimeFormat(currentLocale(), { month: "short", day: "2-digit", year: "numeric" }).format(new Date(value));
}

export function formatLastLogin(value: string | null | undefined): string {
  if (!value) return i18n.t("dates.pendingSync", { ns: "account" });

  const date = new Date(value);
  const now = new Date();
  const timeZone = "Europe/Madrid";
  const dayFormatter = new Intl.DateTimeFormat(currentLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone,
  });
  const isToday = dayFormatter.format(date) === dayFormatter.format(now);
  const time = new Intl.DateTimeFormat(currentLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);

  if (isToday) return i18n.t("dates.today", { ns: "account", time });

  const day = new Intl.DateTimeFormat(currentLocale(), {
    month: "short",
    day: "2-digit",
    timeZone,
  }).format(date);

  return i18n.t("dates.day", { ns: "account", day, time });
}
