import { useQueryClient } from "@tanstack/react-query";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../../i18n";

/**
 * Flag buttons to change the language (UK flag = English, Spain = Spanish).
 * Used in the shop header, the mobile menu and the admin panel.
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
          aria-label={t(`language.${language}`)}
          title={t(`language.${language}`)}
        >
          {language === "es" ? <SpainFlag /> : <UkFlag />}
        </button>
      ))}
    </div>
  );
}

// Flags are drawn with SVG (not emoji) because Windows doesn't show flag emojis.

function SpainFlag() {
  return (
    <svg className="flag" viewBox="0 0 3 2" aria-hidden="true">
      <rect width="3" height="2" fill="#AA151B" />
      <rect y="0.5" width="3" height="1" fill="#F1BF00" />
    </svg>
  );
}

function UkFlag() {
  // The red diagonals are clipped so they sit off-centre, like the real flag.
  // useId gives each flag its own clip id (there can be several on the page).
  const clipId = useId();

  return (
    <svg className="flag" viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <clipPath id={clipId}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath={`url(#${clipId})`} />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}
