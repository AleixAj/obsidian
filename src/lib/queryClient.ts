/**
 * Single `QueryClient` instance shared across the SPA.
 *
 * Tuning notes:
 *   - `staleTime: 60s` — the catalogue barely changes during a session,
 *     so a minute of "fresh" lets us avoid refetching every PLP/PDP
 *     remount. React Query still refetches on window focus by default,
 *     which we keep — it's the cheapest way to stay in sync if the
 *     user leaves a tab open overnight.
 *   - `retry: 1` — one extra attempt is enough to recover from a
 *     transient backend hiccup without making the user wait through
 *     three exponential backoffs. Errors that won't change by trying
 *     again (401, 403, 404, 419) are not retried.
 *   - `refetchOnWindowFocus: false` for products — they're effectively
 *     static for the duration of a browsing session and refetching on
 *     every tab switch produces noisy loading flickers.
 *   - Session expired: if any request answers 401 (not signed in) or
 *     419 (old CSRF token), we forget the saved user. The shop then shows
 *     you as signed out and the admin panel sends you to its login page.
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

  // Only when we still think someone is signed in. This also avoids
  // touching the user query when it is the one that answered 401.
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
