import type { ReactNode } from "react";
import { useReveal } from "../../hooks/useReveal";

/**
 * Wraps children in a div that fades & slides up when scrolled into
 * view. The `delay` prop lets us stagger grids of cards so they feel
 * choreographed rather than popping in all at once.
 */
interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const [ref, visible] = useReveal<HTMLDivElement>(delay);
  return (
    <div ref={ref} className={`reveal ${visible ? "visible" : ""} ${className}`}>
      {children}
    </div>
  );
}
