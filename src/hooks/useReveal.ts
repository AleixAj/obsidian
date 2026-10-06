import { useEffect, useRef, useState } from "react";

/**
 * Tells when an element appears on screen while scrolling.
 * Returns a ref to put on the element, and `visible`, which becomes true
 * the first time it shows up. Used by <Reveal> for the fade-in effect.
 *
 * @param delay  Milliseconds to wait before showing it, so cards in a
 *               grid appear one after the other.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  delay = 0,
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // IntersectionObserver calls us when the element enters the screen
    // (12% of it is visible). After the first time we stop watching.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.setTimeout(() => setVisible(true), delay);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return [ref, visible];
}
