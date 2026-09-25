import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Logo } from "../ui/Logo";

/**
 * Footer navigation columns — kept as data so they're easy to extend.
 * Titles and labels are translation keys (footer.columns.* and footer.links.*).
 */
const COLUMNS: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: "shop",
    links: [
      { to: "/shop/new", label: "newIn" },
      { to: "/shop/outerwear", label: "outerwear" },
      { to: "/shop/knitwear", label: "knitwear" },
      { to: "/shop/accessories", label: "accessories" },
      { to: "/shop/archive", label: "archive" },
    ],
  },
  {
    title: "about",
    links: [
      { to: "/lookbook", label: "story" },
      { to: "/lookbook", label: "lookbook" },
      { to: "/lookbook", label: "materials" },
      { to: "/lookbook", label: "stockists" },
      { to: "/lookbook", label: "journal" },
    ],
  },
  {
    title: "service",
    links: [
      { to: "/lookbook", label: "shipping" },
      { to: "/lookbook", label: "returns" },
      { to: "/lookbook", label: "sizeGuide" },
      { to: "/lookbook", label: "contact" },
      { to: "/lookbook", label: "faq" },
    ],
  },
];

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Logo />
          <p>{t("footer.tagline")}</p>
        </div>

        {COLUMNS.map((col) => (
          <div className="footer-col" key={col.title}>
            <h4>{t(`footer.columns.${col.title}`)}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={`${col.title}-${link.label}`}>
                  <Link to={link.to}>{t(`footer.links.${link.label}`)}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="footer-col footer-newsletter">
          <h4>{t("footer.newsletter.title")}</h4>
          <p style={{ color: "var(--fg-dim)", fontSize: 13, marginBottom: 16 }}>
            {t("footer.newsletter.text")}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // The newsletter submit is a UI mock for now.
            }}
          >
            <input type="email" placeholder={t("footer.newsletter.placeholder")} required />
            <button type="submit">{t("footer.newsletter.subscribe")}</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        <div className="links">
          <Link to="/privacy">{t("footer.privacy")}</Link>
          <Link to="/terms">{t("footer.terms")}</Link>
          <a>{t("footer.cookies")}</a>
          <a>Instagram ↗</a>
          <a>TikTok ↗</a>
        </div>
      </div>
    </footer>
  );
}
