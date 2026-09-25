import i18n from "../i18n";
import { ApiError } from "../lib/api";

// Laravel's default texts for a 403. They don't say anything useful,
// so we show our own text instead ("Your role can't do this.").
const DEFAULT_403_MESSAGES = ["This action is unauthorized.", "Forbidden"];

/**
 * Turns an API error into one short message for the user.
 * Laravel validation errors (422) look like { errors: { field: ["message"] } },
 * so we show the first message. Other errors (403, 409...) may bring a
 * { message } written for the user, e.g. "The demo accounts can't change the catalogue."
 * This is not a component, so it uses i18n.t() instead of the useTranslation hook.
 */
export function errorMessage(error: unknown, fallback = i18n.t("admin:errors.generic")): string {
  if (!(error instanceof ApiError)) return fallback;

  const payload = error.payload as { message?: string; errors?: Record<string, string[]> } | undefined;

  if (error.status === 403) {
    const message = payload?.message;
    return message && !DEFAULT_403_MESSAGES.includes(message) ? message : i18n.t("admin:errors.forbidden");
  }

  const firstError = payload?.errors ? Object.values(payload.errors)[0]?.[0] : undefined;

  return firstError ?? payload?.message ?? fallback;
}
