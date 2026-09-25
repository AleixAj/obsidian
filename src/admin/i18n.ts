/**
 * Texts of the admin panel ("admin" namespace).
 *
 * They are added here, and not in src/i18n/index.ts, so the shop
 * doesn't download the panel's texts: this file is only loaded
 * together with the rest of the admin panel.
 *
 * In a component:  const { t } = useTranslation("admin");
 */

import i18n from "../i18n";
import en from "../i18n/locales/en/admin.json";
import es from "../i18n/locales/es/admin.json";

i18n.addResourceBundle("en", "admin", en);
i18n.addResourceBundle("es", "admin", es);
