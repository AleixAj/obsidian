import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { LOGISTICS_NAV, MAIN_NAV } from "../navigation";
import { PageHeader } from "../components/PageHeader";

/** Placeholder for sections planned in the next versions of the panel. */
export function ComingSoon() {
  const { t } = useTranslation("admin");
  const { pathname } = useLocation();
  const section = [...MAIN_NAV, ...LOGISTICS_NAV].find((item) => item.path === pathname);

  return (
    <>
      <PageHeader title={section ? t(section.label) : t("comingSoon.notFound")} />
      <div className="adm-empty">
        <strong>{section ? t("comingSoon.title") : t("comingSoon.missing")}</strong>
        {section && <span>{t("comingSoon.text")}</span>}
      </div>
    </>
  );
}
