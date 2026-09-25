import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Icon } from "../components/ui/Icon";

/** Friendly 404 — keeps the brand voice rather than a sterile message. */
export function NotFound() {
  const { t } = useTranslation("shop");
  return (
    <main className="fade-in notfound">
      <h1>404</h1>
      <p>{t("notFound.text")}</p>
      <Link to="/shop/new" className="btn btn-primary">
        {t("notFound.back")} <Icon.Arrow />
      </Link>
    </main>
  );
}
