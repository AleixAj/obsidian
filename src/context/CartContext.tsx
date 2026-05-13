import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useUser } from "../hooks/queries";
import {
  useAddCartItem,
  useCartQuery,
  useClearCart,
  useDeleteCartItem,
  useMergeCart,
  useUpdateCartItem,
} from "../hooks/queries/useCartSync";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { toProduct, type ApiCartDTO, type CartLinePayload } from "../lib/api";
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
  const [guestItems, setGuestItems] = useLocalStorage<CartItem[]>("obsidian:cart", []);
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useUser();
  const isAuthenticated = Boolean(user);
  const cartQuery = useCartQuery(isAuthenticated);
  const addCartItem = useAddCartItem();
  const updateCartItem = useUpdateCartItem();
  const deleteCartItem = useDeleteCartItem();
  const clearCart = useClearCart();
  const mergeCart = useMergeCart();
  const mergedGuestCartForUser = useRef<number | null>(null);

  const serverItems = useMemo(
    () => (cartQuery.data ? toCartItems(cartQuery.data) : []),
    [cartQuery.data],
  );
  const items = isAuthenticated ? serverItems : guestItems;

  useEffect(() => {
    if (!user) {
      mergedGuestCartForUser.current = null;
      return;
    }

    if (guestItems.length === 0 || mergeCart.isPending) return;
    if (mergedGuestCartForUser.current === user.id) return;

    mergedGuestCartForUser.current = user.id;
    mergeCart.mutate(toCartPayload(guestItems), {
      onSuccess: () => setGuestItems([]),
      onError: () => {
        mergedGuestCartForUser.current = null;
      },
    });
  }, [guestItems, mergeCart, setGuestItems, user]);

  const add = useCallback<CartContextValue["add"]>(
    (product) => {
      const size = product.size || product.sizes?.[0] || "M";
      if (isAuthenticated) {
        addCartItem.mutate({
          product_slug: product.id,
          size_label: size,
          color_hex: product.colors?.[0] ?? null,
          quantity: 1,
        });
        setIsOpen(true);
        return;
      }

      setGuestItems((prev) => {
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
    [addCartItem, isAuthenticated, setGuestItems],
  );

  const updateQty = useCallback<CartContextValue["updateQty"]>(
    (index, delta) => {
      if (isAuthenticated) {
        const line = serverItems[index];
        const serverLine = cartQuery.data?.items[index];
        if (!line || !serverLine) return;
        updateCartItem.mutate({
          id: serverLine.id,
          quantity: Math.max(1, line.qty + delta),
        });
        return;
      }

      setGuestItems((prev) => {
        const copy = [...prev];
        if (!copy[index]) return prev;
        copy[index] = {
          ...copy[index],
          qty: Math.max(1, copy[index].qty + delta),
        };
        return copy;
      });
    },
    [cartQuery.data?.items, isAuthenticated, serverItems, setGuestItems, updateCartItem],
  );

  const remove = useCallback<CartContextValue["remove"]>(
    (index) => {
      if (isAuthenticated) {
        const serverLine = cartQuery.data?.items[index];
        if (!serverLine) return;
        deleteCartItem.mutate(serverLine.id);
        return;
      }

      setGuestItems((prev) => prev.filter((_, i) => i !== index));
    },
    [cartQuery.data?.items, deleteCartItem, isAuthenticated, setGuestItems],
  );

  const clear = useCallback(() => {
    if (isAuthenticated) {
      clearCart.mutate();
      return;
    }

    setGuestItems([]);
  }, [clearCart, isAuthenticated, setGuestItems]);
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

function toCartItems(cart: ApiCartDTO): CartItem[] {
  return cart.items.map((line) => ({
    ...toProduct(line.product),
    size: line.size_label || line.product.sizes?.[0]?.label || "M",
    colorName: line.color_hex || undefined,
    qty: line.quantity,
  }));
}

function toCartPayload(items: CartItem[]): CartLinePayload[] {
  return items.map((line) => ({
    product_slug: line.id,
    size_label: line.size,
    color_hex: line.colors?.[0] ?? null,
    quantity: line.qty,
  }));
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
