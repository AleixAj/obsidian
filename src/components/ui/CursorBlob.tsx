import { useEffect, useRef } from "react";

/**
 * Decorative gold "blob" that follows the cursor with a `screen`
 * blend mode, giving the impression of a soft moving light.
 *
 * Skipped on touch devices: no cursor → no blob.
 */
export function CursorBlob() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const handler = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    };
    window.addEventListener("pointermove", handler);
    return () => window.removeEventListener("pointermove", handler);
  }, []);

  return <div ref={ref} className="cursor-blob" aria-hidden="true" />;
}
