import i18n from "../i18n";
import { ApiError, apiErrorMessage } from "../lib/api";

// Laravel's default texts for a 403. They don't say anything useful,
// so we show our own text instead ("Your role can't do this.").
const DEFAULT_403_MESSAGES = ["This action is unauthorized.", "Forbidden"];

/**
 * Turns an API error into one short message for the panel.
 * It's the same as apiErrorMessage() from the shop (first validation
 * error, or the API's message), except for 403: there we only keep the
 * API's text when it says something useful, e.g. "The demo accounts
 * can't change the catalogue."
 * This is not a component, so it uses i18n.t() instead of the useTranslation hook.
 */
export function errorMessage(error: unknown, fallback = i18n.t("admin:errors.generic")): string {
  if (!(error instanceof ApiError)) return fallback;

  if (error.status === 403) {
    const message = (error.payload as { message?: string } | undefined)?.message;
    return message && !DEFAULT_403_MESSAGES.includes(message) ? message : i18n.t("admin:errors.forbidden");
  }

  return apiErrorMessage(error) ?? fallback;
}
