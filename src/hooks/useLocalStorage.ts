import { useEffect, useState } from "react";

/**
 * Like useState, but the value is also saved in localStorage, so it's
 * still there after a reload. Used for the guest cart and wishlist.
 *
 * If the saved value is broken (bad JSON) we start again with `initial`.
 *
 * @example
 *   const [cart, setCart] = useLocalStorage<CartItem[]>("obsidian:cart", []);
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      // Bad JSON, or storage blocked: start with the default value.
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be blocked or full (private mode). Then we just don't save.
    }
  }, [key, value]);

  return [value, setValue];
}
