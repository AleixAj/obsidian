import type { SVGProps } from "react";

/**
 * Inline SVG icon set.
 *
 * Keeping every icon in one tree-shakable module means we never ship
 * an unused glyph, and `currentColor` lets a single component pick up
 * the parent's text colour (hover states, gold accents, etc.).
 */
export const Icon = {
  Search: (p: SVGProps<SVGSVGElement>) => (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} {...p}>
      <circle cx="7" cy="7" r="5" />
      <line x1="11" y1="11" x2="14" y2="14" />
    </svg>
  ),
  Bag: (p: SVGProps<SVGSVGElement>) => (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} {...p}>
      <path d="M3 5h10l-1 9H4L3 5z" />
      <path d="M6 5V3.5a2 2 0 0 1 4 0V5" />
    </svg>
  ),
  User: (p: SVGProps<SVGSVGElement>) => (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} {...p}>
      <circle cx="8" cy="6" r="2.5" />
      <path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" />
    </svg>
  ),
  Arrow: (p: SVGProps<SVGSVGElement>) => (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.2} {...p}>
      <line x1="2" y1="7" x2="12" y2="7" />
      <polyline points="8,3 12,7 8,11" />
    </svg>
  ),
  ArrowDown: (p: SVGProps<SVGSVGElement>) => (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.2} {...p}>
      <line x1="6" y1="2" x2="6" y2="10" />
      <polyline points="2,6 6,10 10,6" />
    </svg>
  ),
  Heart: (p: SVGProps<SVGSVGElement>) => (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.2} {...p}>
      <path d="M9 15.5l-5.5-5a3.5 3.5 0 0 1 5-5L9 6.5l.5-1a3.5 3.5 0 0 1 5 5L9 15.5z" />
    </svg>
  ),
  Plus: (p: SVGProps<SVGSVGElement>) => (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.4} {...p}>
      <line x1="6" y1="2" x2="6" y2="10" />
      <line x1="2" y1="6" x2="10" y2="6" />
    </svg>
  ),
  Close: (p: SVGProps<SVGSVGElement>) => (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.2} {...p}>
      <line x1="3" y1="3" x2="11" y2="11" />
      <line x1="11" y1="3" x2="3" y2="11" />
    </svg>
  ),
  Zoom: (p: SVGProps<SVGSVGElement>) => (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.2} {...p}>
      <circle cx="6" cy="6" r="4" />
      <line x1="9" y1="9" x2="12" y2="12" />
      <line x1="6" y1="4" x2="6" y2="8" />
      <line x1="4" y1="6" x2="8" y2="6" />
    </svg>
  ),
};
