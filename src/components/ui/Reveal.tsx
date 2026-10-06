import type { ReactNode } from "react";
import { useReveal } from "../../hooks/useReveal";

/**
 * Its content fades in and moves up a little when it appears on screen.
 * With `delay`, the cards of a grid can appear one after the other.
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
