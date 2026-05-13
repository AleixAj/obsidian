/**
 * Auth data layer for Sanctum SPA sessions.
 *
 * The Laravel backend owns the session cookie. React Query owns the
 * client-side cache of the current user, and mutations update that cache
 * immediately after login/register/logout so the UI reacts without a
 * full page reload.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchUser,
  login,
  logout,
  register,
  updateUser,
  type ApiUserDTO,
  type AuthCredentials,
  type RegisterPayload,
  type UpdateUserPayload,
} from "../../lib/api";
import { accountKeys } from "./useAccount";
import { cartKeys } from "./useCartSync";

export const authKeys = {
  user: ["user"] as const,
};

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
      queryClient.setQueryData(authKeys.user, user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: (user: ApiUserDTO) => {
      queryClient.setQueryData(authKeys.user, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.user, null);
      queryClient.removeQueries({ queryKey: cartKeys.cart });
      queryClient.invalidateQueries({ queryKey: authKeys.user });
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
