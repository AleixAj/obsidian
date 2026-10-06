/**
 * The React Query client (the cache of everything we load from the API).
 *
 * - staleTime 60s: data loaded less than a minute ago is used as it is,
 *   so going back and forth between pages doesn't ask the API again.
 * - retry: one more try if a request fails, in case the server had a
 *   small hiccup. Not for 401, 403, 404 or 419: trying again won't help.
 * - refetchOnWindowFocus off: coming back to the tab doesn't reload
 *   everything (it made the pages flicker for nothing).
 * - Session expired: if any request answers 401 (not signed in) or
 *   419 (old CSRF token), we forget the saved user. The shop then shows
 *   you as signed out and the admin panel sends you to its login page.
 */

import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { authKeys } from "../hooks/queries/useAuth";
import { ApiError } from "./api";

// Trying again won't fix these.
const NO_RETRY_STATUSES = [401, 403, 404, 419];

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && NO_RETRY_STATUSES.includes(error.status)) return false;
  return failureCount < 1;
}

/** Forgets the user when the session is gone (401 or 419). */
function handleSessionError(error: unknown) {
  if (!(error instanceof ApiError)) return;
  if (error.status !== 401 && error.status !== 419) return;

  // Only when we still think someone is signed in. The user query itself
  // never lands here on a 401: fetchUser returns null for signed-out
  // visitors. Setting null doesn't refetch anything, so there's no loop.
  if (queryClient.getQueryData(authKeys.user)) {
    queryClient.setQueryData(authKeys.user, null);
  }
}

export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleSessionError }),
  mutationCache: new MutationCache({ onError: handleSessionError }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
  },
});
