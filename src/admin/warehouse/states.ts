import type { LocationState, WarehouseLocation } from "../api";

/**
 * Colours and names of each location state.
 * The 3D view, the plan and the list use the same ones.
 */
export const STATE_COLORS: Record<LocationState, string> = {
  ok: "#6fb38b", // green: enough units
  low: "#e0a44a", // amber: at or below the alert level
  out: "#d96446", // red: no units left
  empty: "#3a3630", // grey: nothing stored here
};

/** Translation keys (admin.json), shown with t(STATE_LABELS[state]). */
export const STATE_LABELS: Record<LocationState, string> = {
  ok: "warehouse.states.ok",
  low: "warehouse.states.low",
  out: "warehouse.states.out",
  empty: "warehouse.states.empty",
};

/** How full the location is, from 0 to 1 (used for the box height and the bars). */
export function fillRatio(location: WarehouseLocation): number {
  if (location.capacity === 0) return 0;
  return Math.min(1, location.stock / location.capacity);
}

/** The filter chips above the views. */
export type StateFilter = "all" | "low" | "out" | "empty";

/**
 * Does this location match the search box and the filter chip?
 * Locations that don't match are shown faded, not hidden,
 * so you still see where they are in the warehouse.
 */
export function matches(location: WarehouseLocation, search: string, filter: StateFilter): boolean {
  if (filter !== "all" && location.state !== filter) return false;
  if (!search) return true;

  const text = search.toLowerCase();
  return (
    location.code.toLowerCase().includes(text) ||
    (location.variant?.sku.toLowerCase().includes(text) ?? false) ||
    (location.variant?.product_name.toLowerCase().includes(text) ?? false)
  );
}
