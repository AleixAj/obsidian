import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { CartItem, Product } from "../types";

/**
 * Shape exposed by `useCart()` to the rest of the app.
 *
 * The cart is intentionally kept simple (no SKUs, no taxes): every
 * unique combination of (productId + size) becomes a line item, and
 * line items are merged when the user adds the same combo twice.
 */
interface CartContextValue {
  /** Current line items. */
  items: CartItem[];
  /** Whether the cart drawer is currently open. */
  isOpen: boolean;
  /** Total count, summing the `qty` of every line. */
  totalCount: number;
  /** Sum of `price * qty` across every line. */
  subtotal: number;
  /** Add a product (optionally pre-sized). Opens the drawer. */
  add: (product: Product & { size?: string; colorName?: string }) => void;
  /** Increment / decrement qty for a given line index. */
  updateQty: (index: number, delta: number) => void;
  /** Remove a line entirely. */
  remove: (index: number) => void;
  /** Empty the cart. */
  clear: () => void;
  /** Open / close the side drawer. */
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

/**
 * Provider that owns the cart state and persists it to localStorage.
 * Wrap the application root with `<CartProvider>` (already done in
 * `App.tsx`) and access the API anywhere via `useCart()`.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>("obsidian:cart", []);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback<CartContextValue["add"]>(
    (product) => {
      const size = product.size || product.sizes?.[0] || "M";
      setItems((prev) => {
        const existing = prev.findIndex(
          (line) => line.id === product.id && line.size === size,
        );
        if (existing > -1) {
          const copy = [...prev];
          copy[existing] = { ...copy[existing], qty: copy[existing].qty + 1 };
          return copy;
        }
        return [...prev, { ...product, size, qty: 1 }];
      });
      setIsOpen(true);
    },
    [setItems],
  );

  const updateQty = useCallback<CartContextValue["updateQty"]>(
    (index, delta) => {
      setItems((prev) => {
        const copy = [...prev];
        if (!copy[index]) return prev;
        copy[index] = {
          ...copy[index],
          qty: Math.max(1, copy[index].qty + delta),
        };
        return copy;
      });
    },
    [setItems],
  );

  const remove = useCallback<CartContextValue["remove"]>(
    (index) => setItems((prev) => prev.filter((_, i) => i !== index)),
    [setItems],
  );

  const clear = useCallback(() => setItems([]), [setItems]);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Derived values are memoised so consumers only re-render on real changes.
  const totalCount = useMemo(
    () => items.reduce((sum, line) => sum + line.qty, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, line) => sum + line.price * line.qty, 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    isOpen,
    totalCount,
    subtotal,
    add,
    updateQty,
    remove,
    clear,
    open,
    close,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook for consuming the cart from any component.
 * Throws when used outside a `<CartProvider>` so we never silently
 * read stale state during refactors.
 */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a <CartProvider>");
  return ctx;
}
