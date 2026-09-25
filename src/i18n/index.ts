/**
 * Translations (English and Spanish) with i18next.
 *
 * - The texts live in JSON files: src/i18n/locales/{en,es}/{namespace}.json
 * - A "namespace" is one group of texts: common (header, footer, cart...),
 *   shop (home, catalogue, product), account (sign in, account page),
 *   legal (privacy and terms) and admin (the admin panel).
 * - In a component:  const { t } = useTranslation("shop");  then  t("home.title")
 *
 * Which language? The one the visitor chose before (saved in localStorage),
 * or else the browser's language: Spanish browsers get Spanish, everyone
 * else gets English.
 */

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enAccount from "./locales/en/account.json";
import enCommon from "./locales/en/common.json";
import enLegal from "./locales/en/legal.json";
import enShop from "./locales/en/shop.json";
import esAccount from "./locales/es/account.json";
import esCommon from "./locales/es/common.json";
import esLegal from "./locales/es/legal.json";
import esShop from "./locales/es/shop.json";

export const LANGUAGES = ["en", "es"] as const;
export type Language = (typeof LANGUAGES)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, shop: enShop, account: enAccount, legal: enLegal },
      es: { common: esCommon, shop: esShop, account: esAccount, legal: esLegal },
    },
    supportedLngs: LANGUAGES,
    // "es-ES" or "es-MX" from the browser become "es".
    load: "languageOnly",
    fallbackLng: "en",
    defaultNS: "common",
    // React already protects against HTML injection.
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "obsidian-language",
      caches: ["localStorage"],
    },
  });

/** The current language, always "en" or "es". */
export function currentLanguage(): Language {
  return i18n.resolvedLanguage === "es" ? "es" : "en";
}

/**
 * Locale for dates and prices (Intl): "es-ES" shows "1.240,50 €",
 * "en-GB" shows "€1,240.50".
 */
export function currentLocale(): string {
  return currentLanguage() === "es" ? "es-ES" : "en-GB";
}

// Keep <html lang="..."> right, for screen readers and search engines.
// (The "if" is for the unit tests, which run without a browser page.)
if (typeof document !== "undefined") {
  document.documentElement.lang = currentLanguage();
  i18n.on("languageChanged", () => {
    document.documentElement.lang = currentLanguage();
  });
}

export default i18n;
