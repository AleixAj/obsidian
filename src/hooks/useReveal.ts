import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref + boolean tuple that toggles to `true` once the
 * referenced element scrolls into view. Used by the `<Reveal>` wrapper
 * for the subtle fade-in-on-scroll effect across the site.
 *
 * @param delay  Milliseconds to wait before triggering the reveal,
 *               useful for staggering grids of cards.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  delay = 0,
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
