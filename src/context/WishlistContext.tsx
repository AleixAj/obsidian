import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

/**
 * The wishlist is intentionally a `string[]` of product ids — every
 * other piece of data (image, price) can be re-derived from the
 * catalogue, so there is nothing to keep in sync.
 */
interface WishlistContextValue {
  ids: string[];
  count: number;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useLocalStorage<string[]>("obsidian:wishlist", [
    "p2",
    "p4",
    "p5",
    "p7",
    "p9",
  ]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) =>
      setIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      ),
    [setIds],
  );

  const remove = useCallback(
    (id: string) => setIds((prev) => prev.filter((x) => x !== id)),
    [setIds],
  );

  const clear = useCallback(() => setIds([]), [setIds]);

  const value = useMemo<WishlistContextValue>(
    () => ({ ids, count: ids.length, has, toggle, remove, clear }),
    [ids, has, toggle, remove, clear],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a <WishlistProvider>");
  return ctx;
}
