import i18n from "../i18n";
import { ApiError } from "../lib/api";

/**
 * Turns an API error into one short message for the user.
 * Laravel validation errors (422) look like { errors: { field: ["message"] } },
 * so we show the first message.
 * This is not a component, so it uses i18n.t() instead of the useTranslation hook.
 */
export function errorMessage(error: unknown, fallback = i18n.t("admin:errors.generic")): string {
  if (!(error instanceof ApiError)) return fallback;
  if (error.status === 403) return i18n.t("admin:errors.forbidden");

  const payload = error.payload as { message?: string; errors?: Record<string, string[]> } | undefined;
  const firstError = payload?.errors ? Object.values(payload.errors)[0]?.[0] : undefined;

  return firstError ?? payload?.message ?? fallback;
}
