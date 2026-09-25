/**
 * Small helpers shared by the list pages (orders, products, customers, returns).
 */

import type { MouseEvent } from "react";

/** The page number from the URL. Anything that is not a whole number ≥ 1 (like "abc") is page 1. */
export function pageFromUrl(params: URLSearchParams): number {
  const page = Number(params.get("page"));
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

/**
 * Click handler for a table row that opens a page.
 * It does nothing when the click was on a link (the link already opens it)
 * or when Ctrl/Cmd/Shift is pressed (the browser opens a new tab or window).
 */
export function openRow(open: () => void) {
  return (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("a, button")) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    open();
  };
}
