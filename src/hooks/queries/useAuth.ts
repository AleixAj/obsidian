/**
 * Who is signed in, and the actions that change it (sign in, sign up,
 * sign out, profile and photo).
 *
 * Laravel keeps the session in a cookie. Here we keep a copy of the user
 * in React Query, and update it right after each action, so the whole app
 * changes at once without reloading the page.
 */

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  deleteAvatar,
  demoLogin,
  fetchUser,
  login,
  logout,
  register,
  updateUser,
  uploadAvatar,
  type ApiUserDTO,
  type AuthCredentials,
  type DemoRole,
  type RegisterPayload,
  type UpdateUserPayload,
} from "../../lib/api";
import { accountKeys } from "./useAccount";

export const authKeys = {
  user: ["user"] as const,
};

/** Catalogue data is the same for every visitor, so it can stay cached. */
const PUBLIC_QUERY_KEYS = ["user", "products", "product", "categories"];

/**
 * Forget everything that belongs to the previous user (account, orders,
 * cart, wishlist, admin pages...), so it's never shown to the next one.
 */
function forgetPrivateData(queryClient: QueryClient) {
  queryClient.removeQueries({
    predicate: (query) => !PUBLIC_QUERY_KEYS.includes(String(query.queryKey[0])),
  });
}

export function useUser() {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: fetchUser,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AuthCredentials) => login(payload),
    onSuccess: (user: ApiUserDTO) => {
      forgetPrivateData(queryClient);
      queryClient.setQueryData(authKeys.user, user);
    },
  });
}

export function useDemoLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: DemoRole) => demoLogin(role),
    // Load the new user (and its role) from /api/user.
    onSuccess: () => {
      forgetPrivateData(queryClient);
      return queryClient.invalidateQueries({ queryKey: authKeys.user });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: (user: ApiUserDTO) => {
      forgetPrivateData(queryClient);
      queryClient.setQueryData(authKeys.user, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    // onSettled runs on success AND on error: if the session had already
    // expired (419), we still clear the local session and the user's data.
    onSettled: () => {
      queryClient.setQueryData(authKeys.user, null);
      forgetPrivateData(queryClient);
    },
  });
}

/** Upload a new profile photo (or remove it with useDeleteAvatar). */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: (user: ApiUserDTO) => {
      queryClient.setQueryData(authKeys.user, user);
      queryClient.invalidateQueries({ queryKey: accountKeys.account });
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAvatar,
    onSuccess: (user: ApiUserDTO) => {
      queryClient.setQueryData(authKeys.user, user);
      queryClient.invalidateQueries({ queryKey: accountKeys.account });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(payload),
    onSuccess: (user: ApiUserDTO) => {
      queryClient.setQueryData(authKeys.user, user);
      queryClient.invalidateQueries({ queryKey: accountKeys.account });
    },
  });
}
