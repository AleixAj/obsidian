/**
 * Small display helpers for the admin panel.
 */

import { currentLocale } from "../i18n";
import type { OrderStatus, ReturnStatus, Role } from "./api";

// The Intl formatters are created inside each function, so they always
// use the language chosen right now (EN or ES).

/**
 * The store is in Barcelona, and the API counts days (charts, "today"...)
 * in this time zone. Dates use it too, so a sale at 00:30 in Spain is on
 * the same day here, wherever the person using the panel is.
 */
export const STORE_TIME_ZONE = "Europe/Madrid";

/** 12950 → "€129.50" (EN) or "129,50 €" (ES) */
export function money(cents: number): string {
  return new Intl.NumberFormat(currentLocale(), { style: "currency", currency: "EUR" }).format(cents / 100);
}

/** 16216500 → "€162,165" (no decimals, for big KPI numbers) */
export function moneyShort(cents: number): string {
  return new Intl.NumberFormat(currentLocale(), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** 1240 → "1,240" (EN) or "1240" (ES) */
export function count(value: number): string {
  return value.toLocaleString(currentLocale());
}

/** "2026-09-24T10:15:00Z" → "24 Sep 2026, 10:15" */
export function dateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(currentLocale(), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: STORE_TIME_ZONE,
  }).format(new Date(iso));
}

/** "2026-09-24T10:15:00Z" → "24 Sep" */
export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat(currentLocale(), { day: "2-digit", month: "short", timeZone: STORE_TIME_ZONE }).format(new Date(iso));
}

/** "2025-09-11T10:15:00Z" → "Sep 2025" */
export function monthYear(iso: string): string {
  return new Intl.DateTimeFormat(currentLocale(), { month: "short", year: "numeric", timeZone: STORE_TIME_ZONE }).format(new Date(iso));
}

/** Label under the sales chart: "26 Aug", or "14:00" when the chart is by hour. */
export function chartLabel(iso: string, byHour: boolean): string {
  const options: Intl.DateTimeFormatOptions = byHour
    ? { hour: "2-digit", minute: "2-digit", timeZone: STORE_TIME_ZONE }
    : { day: "numeric", month: "short", timeZone: STORE_TIME_ZONE };
  return new Intl.DateTimeFormat(currentLocale(), options).format(new Date(iso));
}

// The label maps below store translation keys (admin.json), not texts.
// Components show them with t(), e.g. t(STATUS_LABELS.paid) → "Paid" / "Pagado".

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "status.pending",
  paid: "status.paid",
  preparing: "status.preparing",
  shipped: "status.shipped",
  delivered: "status.delivered",
  returned: "status.returned",
  cancelled: "status.cancelled",
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "roles.admin",
  warehouse: "roles.warehouse",
  support: "roles.support",
};

/** "Aleix Auqué" → "AA" (for the avatar circle) */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  requested: "returnStatus.requested",
  approved: "returnStatus.approved",
  rejected: "returnStatus.rejected",
  refunded: "returnStatus.refunded",
};

/** Names of the permissions, for the roles table in "Users & roles". */
export const PERMISSION_LABELS: Record<string, string> = {
  dashboard: "permissions.dashboard",
  orders: "permissions.orders",
  stock: "permissions.stock",
  products: "permissions.products",
  customers: "permissions.customers",
  returns: "permissions.returns",
  users: "permissions.users",
};
