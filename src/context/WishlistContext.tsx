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
  const [guestIds, setGuestIds] = useLocalStorage<string[]>("obsidian:wishlist", [
    "p2",
    "p4",
    "p5",
    "p7",
    "p9",
  ]);
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

  useEffect(() => {
    if (!user) {
      mergedGuestWishlistForUser.current = null;
      return;
    }

    if (guestIds.length === 0 || mergeWishlist.isPending) return;
    if (mergedGuestWishlistForUser.current === user.id) return;

    mergedGuestWishlistForUser.current = user.id;
    mergeWishlist.mutate(guestIds, {
      onSuccess: () => setGuestIds([]),
      onError: () => {
        mergedGuestWishlistForUser.current = null;
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
