import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../../i18n";

/**
 * "EN · ES" buttons. Used in the shop header and in the admin panel.
 * The choice is saved, so the next visit opens in the same language.
 */
export function LanguageSwitch({ className = "" }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  function change(language: string) {
    i18n.changeLanguage(language);
    // Messages that come from the API (errors, labels) are translated there,
    // so we load the data again in the new language.
    queryClient.invalidateQueries();
  }

  return (
    <div className={`lang-switch ${className}`} role="group" aria-label={t("language.label")}>
      {LANGUAGES.map((language) => (
        <button
          key={language}
          type="button"
          className={i18n.resolvedLanguage === language ? "is-active" : ""}
          onClick={() => change(language)}
          aria-pressed={i18n.resolvedLanguage === language}
          title={t(`language.${language}`)}
        >
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
