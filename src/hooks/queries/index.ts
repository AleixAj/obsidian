/**
 * Barrel for the data-layer hooks so pages can do
 * `import { useProducts, useProduct, useCategories } from "@/hooks/queries"`
 * regardless of how the file tree evolves later (e.g. when we split
 * mutations into their own folder for Etapa 3+).
 */

export { useCategories } from "./useCategories";
export { useProduct } from "./useProduct";
export { useProducts } from "./useProducts";
export { useLogin, useLogout, useRegister, useUpdateUser, useUser } from "./useAuth";
export {
  useAccount,
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useOrders,
  useUpdateAddress,
} from "./useAccount";
export {
  useAddCartItem,
  useCartQuery,
  useClearCart,
  useDeleteCartItem,
  useMergeCart,
  useUpdateCartItem,
} from "./useCartSync";
export { useCheckout } from "./useCheckout";
export {
  useAddWishlistItem,
  useClearWishlist,
  useDeleteWishlistItem,
  useMergeWishlist,
  useWishlistQuery,
} from "./useWishlistSync";
