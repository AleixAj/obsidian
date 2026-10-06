import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useUser } from "../hooks/queries";
import {
  useAddWishlistItem,
  useClearWishlist,
  useDeleteWishlistItem,
  useMergeWishlist,
  useWishlistQuery,
} from "../hooks/queries/useWishlistSync";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { ApiError } from "../lib/api";

/**
 * The wishlist is just a list of product slugs. The name, photo and
 * price come from the products we already load, so they're never out of date.
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

/**
 * Keeps the wishlist. Same idea as the cart: guests keep it in
 * localStorage, signed-in users in the API, and a guest's list is
 * added to the API one when they sign in.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [guestIds, setGuestIds] = useLocalStorage<string[]>("obsidian:wishlist", []);
  const { data: user } = useUser();
  const isAuthenticated = Boolean(user);
  const wishlistQuery = useWishlistQuery(isAuthenticated);
  const addWishlistItem = useAddWishlistItem();
  const deleteWishlistItem = useDeleteWishlistItem();
  const clearWishlist = useClearWishlist();
  const mergeWishlist = useMergeWishlist();
  const mergedGuestWishlistForUser = useRef<number | null>(null);

  const serverIds = wishlistQuery.data ?? [];
  const ids = isAuthenticated ? serverIds : guestIds;

  // After signing in: send the guest list to the API, then empty it here.
  useEffect(() => {
    if (!user) {
      mergedGuestWishlistForUser.current = null;
      return;
    }

    if (guestIds.length === 0 || mergeWishlist.isPending) return;
    if (mergedGuestWishlistForUser.current === user.id) return;

    // We only try once per login. If it fails we don't try again (that
    // would loop forever); if the server says the data is wrong, we drop it.
    mergedGuestWishlistForUser.current = user.id;
    mergeWishlist.mutate(guestIds, {
      onSuccess: () => setGuestIds([]),
      onError: (error) => {
        if (error instanceof ApiError && error.status === 422) setGuestIds([]);
      },
    });
  }, [guestIds, mergeWishlist, setGuestIds, user]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) => {
      if (isAuthenticated) {
        if (ids.includes(id)) {
          deleteWishlistItem.mutate(id);
          return;
        }

        addWishlistItem.mutate(id);
        return;
      }

      setGuestIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    },
    [addWishlistItem, deleteWishlistItem, ids, isAuthenticated, setGuestIds],
  );

  const remove = useCallback(
    (id: string) => {
      if (isAuthenticated) {
        deleteWishlistItem.mutate(id);
        return;
      }

      setGuestIds((prev) => prev.filter((x) => x !== id));
    },
    [deleteWishlistItem, isAuthenticated, setGuestIds],
  );

  const clear = useCallback(() => {
    if (isAuthenticated) {
      clearWishlist.mutate();
      return;
    }

    setGuestIds([]);
  }, [clearWishlist, isAuthenticated, setGuestIds]);

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
