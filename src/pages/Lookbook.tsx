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
  const frames = [
    {
      label: "FRAME 01 · COMMUNITY",
      img: TEMPLATES.t3,
      palette: "warm" as const,
      ratio: "16 / 9",
    },
    {
      label: "FRAME 02 · EDITORIAL",
      img: TEMPLATES.t4,
      palette: "gold" as const,
      ratio: "16 / 9",
    },
    {
      label: "FRAME 03 · MIDNIGHT TAILORING",
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
          <div className="section-eyebrow">Lookbook 04 ✦ FW26 ✦ Aurum</div>
          <h1
            className="hero-title"
            style={{ fontSize: "clamp(60px, 10vw, 160px)", margin: "16px 0 24px" }}
          >
            <span className="outline">Born in the</span>
            <span className="gold-fill">City.</span>
            <span className="outline italic" style={{ fontSize: "0.65em" }}>
              Forged in Gold.
            </span>
          </h1>
          <p>
            Shot across three nights in Barcelona, Lookbook 04 captures the FW26 collection as it
            lives — under sodium light, on slick streets, between last trains. Cast from our
            resident community of artists, athletes and night-walkers.
          </p>
        </div>
      </section>

      <section style={{ padding: "60px 32px", display: "flex", flexDirection: "column", gap: 48 }}>
        {frames.map((f, i) => (
          <Reveal key={f.label} delay={i * 80}>
            <Placeholder
              label={f.label}
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
          <span>"Gold is not a colour. </span>
          <span className="gold">It's a temperature</span>
          <span>."</span>
        </h2>
        <div className="quote-byline">— Aleix Auqué, Creative Director</div>
        <Link
          to="/shop/new"
          className="btn btn-primary"
          style={{ marginTop: 32, display: "inline-flex" }}
        >
          Shop the drop <Icon.Arrow />
        </Link>
      </section>
    </main>
  );
}
