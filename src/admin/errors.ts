import { ApiError } from "../lib/api";

/**
 * Turns an API error into one short message for the user.
 * Laravel validation errors (422) look like { errors: { field: ["message"] } },
 * so we show the first message.
 */
export function errorMessage(error: unknown, fallback = "Something went wrong. Try again."): string {
  if (!(error instanceof ApiError)) return fallback;
  if (error.status === 403) return "Your role can't do this.";

  const payload = error.payload as { message?: string; errors?: Record<string, string[]> } | undefined;
  const firstError = payload?.errors ? Object.values(payload.errors)[0]?.[0] : undefined;

  return firstError ?? payload?.message ?? fallback;
}
