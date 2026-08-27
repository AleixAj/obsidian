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
  LogOut: (p: SVGProps<SVGSVGElement>) => (
    <svg width={15} height={15} viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth={1.2} {...p}>
      <path d="M6.5 2.5H3.5v10h3" />
      <path d="M8 4.5l3 3-3 3" />
      <path d="M11 7.5H5.5" />
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
  /**
   * Brand marks for the social sign-in buttons. Unlike the rest of the set
   * these are filled logos, not `currentColor` line art: Google's guidelines
   * require its four-colour G, so it keeps its palette on hover while the
   * GitHub mark follows the button's text colour like every other icon.
   */
  Google: (p: SVGProps<SVGSVGElement>) => (
    <svg width={16} height={16} viewBox="0 0 48 48" aria-hidden {...p}>
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  ),
  GitHub: (p: SVGProps<SVGSVGElement>) => (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="currentColor" aria-hidden {...p}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  ),
};
