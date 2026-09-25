import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Icon } from "../components/ui/Icon";
import { Placeholder } from "../components/ui/Placeholder";
import { Reveal } from "../components/ui/Reveal";
import { BRAND, TEMPLATES } from "../data/products";

/**
 * Editorial lookbook page — long-form scrollable story of the drop.
 *
 * Kept intentionally light on product chrome: this is the "brand
 * mood" surface, not a shopping page. The CTA at the bottom bounces
 * back to the shop.
 */
export function Lookbook() {
  const { t } = useTranslation("shop");
  // `label` is a translation key (lookbook.frames.*).
  const frames = [
    {
      label: "community",
      img: TEMPLATES.t3,
      palette: "warm" as const,
      ratio: "16 / 9",
    },
    {
      label: "editorial",
      img: TEMPLATES.t4,
      palette: "gold" as const,
      ratio: "16 / 9",
    },
    {
      label: "tailoring",
      img: TEMPLATES.t1,
      palette: "warm" as const,
      ratio: "3 / 2",
    },
  ];

  return (
    <main className="fade-in">
      <section
        className="lookbook-hero"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.75) 60%, #0a0a0a 100%), url(${BRAND.background3})`,
        }}
      >
        <div className="lookbook-hero-inner">
          <div className="section-eyebrow">{t("lookbook.eyebrow")}</div>
          <h1
            className="hero-title"
            style={{ fontSize: "clamp(60px, 10vw, 160px)", margin: "16px 0 24px" }}
          >
            <span className="outline">{t("lookbook.line1")}</span>
            <span className="gold-fill">{t("lookbook.line2")}</span>
            <span className="outline italic" style={{ fontSize: "0.65em" }}>
              {t("lookbook.line3")}
            </span>
          </h1>
          <p>{t("lookbook.intro")}</p>
        </div>
      </section>

      <section style={{ padding: "60px 32px", display: "flex", flexDirection: "column", gap: 48 }}>
        {frames.map((f, i) => (
          <Reveal key={f.label} delay={i * 80}>
            <Placeholder
              label={t(`lookbook.frames.${f.label}`)}
              palette={f.palette}
              img={f.img}
              style={{ aspectRatio: f.ratio, width: "100%" }}
            />
          </Reveal>
        ))}
      </section>

      <section
        className="quote"
        style={{ paddingInline: 32, borderTop: "1px solid var(--line)" }}
      >
        <h2 className="quote-text">
          <span>{t("lookbook.quote.before")}</span>
          <span className="gold">{t("lookbook.quote.gold")}</span>
          <span>{t("lookbook.quote.after")}</span>
        </h2>
        <div className="quote-byline">{t("home.quote.byline")}</div>
        <Link
          to="/shop/new"
          className="btn btn-primary"
          style={{ marginTop: 32, display: "inline-flex" }}
        >
          {t("cta.shopDrop")} <Icon.Arrow />
        </Link>
      </section>
    </main>
  );
}
