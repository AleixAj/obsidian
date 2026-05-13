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
 *     three exponential backoffs.
 *   - `refetchOnWindowFocus: false` for products — they're effectively
 *     static for the duration of a browsing session and refetching on
 *     every tab switch produces noisy loading flickers.
 */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
