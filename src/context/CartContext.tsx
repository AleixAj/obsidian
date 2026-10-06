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
import { useTranslation } from "react-i18next";
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
import { ApiError, apiErrorMessage, toProduct, type ApiCartDTO, type CartLinePayload } from "../lib/api";
import type { CartItem, Product } from "../types";
import { firstAvailableSize } from "../utils/product";
import { useToast } from "./ToastContext";

/** Most units of one line (the API has the same limit). */
export const MAX_QTY = 99;

/**
 * What useCart() gives to the components.
 *
 * Each line is one product + size + colour. Adding the same one again
 * adds 1 to that line instead of making a new one.
 */
interface CartContextValue {
  /** The lines of the cart. */
  items: CartItem[];
  /** Whether the cart drawer is currently open. */
  isOpen: boolean;
  /** Number of units (the sum of every line's qty). */
  totalCount: number;
  /** Sum of `price * qty` across every line, in cents (same as the API). */
  subtotalCents: number;
  /**
   * Add a product. Without a size we use the first one that isn't sold out,
   * and without a colour the first colour. Opens the drawer when it worked.
   */
  add: (product: Product, choice?: { size?: string; colorHex?: string | null }) => void;
  /** Adds `delta` (+1 or -1) to the qty of the line at `index`. */
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
 * Keeps the cart. There are two carts:
 *   - guest: saved in localStorage, in this browser only.
 *   - signed in: saved in the API (useCartSync), so it's the same on any device.
 * When a guest signs in, their cart is added to the one in the API.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [guestItems, setGuestItems] = useLocalStorage<CartItem[]>("obsidian:cart", []);
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useUser();
  const isAuthenticated = Boolean(user);
  const cartQuery = useCartQuery(isAuthenticated);
  // We only keep `mutate`: it never changes between renders (the whole
  // mutation object does), so the callbacks below stay the same too.
  const { mutate: addCartItem } = useAddCartItem();
  const { mutate: updateCartItem } = useUpdateCartItem();
  const { mutate: deleteCartItem } = useDeleteCartItem();
  const { mutate: clearCart } = useClearCart();
  const mergeCart = useMergeCart();
  const mergedGuestCartForUser = useRef<number | null>(null);
  const { push } = useToast();
  const { t } = useTranslation();

  const serverItems = useMemo(
    () => (cartQuery.data ? toCartItems(cartQuery.data) : []),
    [cartQuery.data],
  );
  const items = isAuthenticated ? serverItems : guestItems;

  // After signing in: send the guest cart to the API, then empty it here.
  useEffect(() => {
    if (!user) {
      mergedGuestCartForUser.current = null;
      return;
    }

    if (guestItems.length === 0 || mergeCart.isPending) return;
    if (mergedGuestCartForUser.current === user.id) return;

    // We only try once per login. If it fails we don't try again (that
    // would loop forever); if the server says the data is wrong, we drop it.
    mergedGuestCartForUser.current = user.id;
    mergeCart.mutate(toCartPayload(guestItems), {
      onSuccess: () => setGuestItems([]),
      onError: (error) => {
        if (error instanceof ApiError && error.status === 422) setGuestItems([]);
      },
    });
  }, [guestItems, mergeCart, setGuestItems, user]);

  const add = useCallback<CartContextValue["add"]>(
    (product, choice = {}) => {
      const size = choice.size ?? firstAvailableSize(product);
      if (!size) {
        push(t("cart.soldOut"), "warn");
        return;
      }
      const colorHex = choice.colorHex ?? product.colors[0]?.hex ?? null;

      if (isAuthenticated) {
        addCartItem(
          {
            product_slug: product.id,
            size_label: size,
            color_hex: colorHex,
            quantity: 1,
          },
          {
            // Only open the bag when the server really added it.
            onSuccess: () => setIsOpen(true),
            onError: (error) => push(apiErrorMessage(error) ?? t("cart.updateFailed"), "warn"),
          },
        );
        return;
      }

      setGuestItems((prev) => {
        const existing = prev.findIndex(
          (line) => line.id === product.id && line.size === size && line.colorHex === colorHex,
        );
        if (existing > -1) {
          const copy = [...prev];
          copy[existing] = { ...copy[existing], qty: Math.min(MAX_QTY, copy[existing].qty + 1) };
          return copy;
        }
        return [...prev, { ...product, size, colorHex, qty: 1 }];
      });
      setIsOpen(true);
    },
    [addCartItem, isAuthenticated, push, setGuestItems, t],
  );

  const updateQty = useCallback<CartContextValue["updateQty"]>(
    (index, delta) => {
      if (isAuthenticated) {
        const line = serverItems[index];
        const serverLine = cartQuery.data?.items[index];
        if (!line || !serverLine) return;
        updateCartItem(
          { id: serverLine.id, quantity: clampQty(line.qty + delta) },
          { onError: (error) => push(apiErrorMessage(error) ?? t("cart.updateFailed"), "warn") },
        );
        return;
      }

      setGuestItems((prev) => {
        const copy = [...prev];
        if (!copy[index]) return prev;
        copy[index] = {
          ...copy[index],
          qty: clampQty(copy[index].qty + delta),
        };
        return copy;
      });
    },
    [cartQuery.data?.items, isAuthenticated, push, serverItems, setGuestItems, t, updateCartItem],
  );

  const remove = useCallback<CartContextValue["remove"]>(
    (index) => {
      if (isAuthenticated) {
        const serverLine = cartQuery.data?.items[index];
        if (!serverLine) return;
        deleteCartItem(serverLine.id);
        return;
      }

      setGuestItems((prev) => prev.filter((_, i) => i !== index));
    },
    [cartQuery.data?.items, deleteCartItem, isAuthenticated, setGuestItems],
  );

  const clear = useCallback(() => {
    if (isAuthenticated) {
      clearCart();
      return;
    }

    setGuestItems([]);
  }, [clearCart, isAuthenticated, setGuestItems]);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const totalCount = useMemo(
    () => items.reduce((sum, line) => sum + line.qty, 0),
    [items],
  );
  // Signed in: the server's total. Guest: we add it up in cents.
  const guestSubtotalCents = useMemo(
    () => guestItems.reduce((sum, line) => sum + Math.round(line.price * 100) * line.qty, 0),
    [guestItems],
  );
  const subtotalCents = isAuthenticated ? (cartQuery.data?.subtotal_cents ?? 0) : guestSubtotalCents;

  // Same object between renders unless something inside changed, so the
  // components that use the cart don't re-render for nothing.
  const value = useMemo<CartContextValue>(
    () => ({ items, isOpen, totalCount, subtotalCents, add, updateQty, remove, clear, open, close }),
    [items, isOpen, totalCount, subtotalCents, add, updateQty, remove, clear, open, close],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Keeps a quantity between 1 and MAX_QTY. */
function clampQty(qty: number): number {
  return Math.min(MAX_QTY, Math.max(1, qty));
}

function toCartItems(cart: ApiCartDTO): CartItem[] {
  return cart.items.map((line) => ({
    ...toProduct(line.product),
    // The price the server will charge for this line.
    price: line.unit_price_cents / 100,
    size: line.size_label ?? "",
    colorHex: line.color_hex,
    qty: line.quantity,
  }));
}

function toCartPayload(items: CartItem[]): CartLinePayload[] {
  return items.map((line) => ({
    product_slug: line.id,
    size_label: line.size,
    color_hex: line.colorHex ?? null,
    quantity: clampQty(line.qty),
  }));
}

/** The cart, from any component. It must be inside <CartProvider> (App.tsx). */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a <CartProvider>");
  return ctx;
}
