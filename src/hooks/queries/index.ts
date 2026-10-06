/**
 * All the data hooks in one place, so pages can write
 * `import { useProducts, useUser } from "../hooks/queries"`.
 */

export { useCategories } from "./useCategories";
export { prefetchProduct, useProduct } from "./useProduct";
export { useProducts } from "./useProducts";
export {
  useDeleteAvatar,
  useDemoLogin,
  useLogin,
  useLogout,
  useRegister,
  useUpdateUser,
  useUploadAvatar,
  useUser,
} from "./useAuth";
export {
  useAccount,
  useCreateAddress,
  useDeleteAddress,
  useOrders,
  useRequestReturn,
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
