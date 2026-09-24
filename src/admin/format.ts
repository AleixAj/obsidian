/**
 * Small display helpers for the admin panel.
 */

import type { OrderStatus, Role } from "./api";

const euros = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const eurosShort = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** 12950 → "€129.50" */
export function money(cents: number): string {
  return euros.format(cents / 100);
}

/** 16216500 → "€162,165" (no decimals, for big KPI numbers) */
export function moneyShort(cents: number): string {
  return eurosShort.format(cents / 100);
}

/** "2026-09-24T10:15:00Z" → "24 Sep 2026, 10:15" */
export function dateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** "2026-09-24T10:15:00Z" → "24 Sep" */
export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date(iso));
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  preparing: "Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  warehouse: "Warehouse",
  support: "Customer support",
};

/** "Marta Soler" → "MS" (for the avatar circle) */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
