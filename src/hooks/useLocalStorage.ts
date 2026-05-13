import { useEffect, useState } from "react";

/**
 * `useLocalStorage` is a `useState` drop-in replacement that persists
 * its value in `window.localStorage`.
 *
 * It is SSR-safe (falls back to the initial value when `window` is
 * undefined) and gracefully recovers from corrupted JSON.
 *
 * @example
 *   const [cart, setCart] = useLocalStorage<CartItem[]>("obsidian:cart", []);
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      // Corrupted JSON / quota errors → fall back to default.
      return initial;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable (private mode, quota). Silently ignore.
    }
  }, [key, value]);

  return [value, setValue];
}
