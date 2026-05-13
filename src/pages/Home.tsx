import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ProductCard } from "../components/product/ProductCard";
import { Icon } from "../components/ui/Icon";
import { Marquee } from "../components/ui/Marquee";
import { Placeholder } from "../components/ui/Placeholder";
import { Reveal } from "../components/ui/Reveal";
import { BRAND, PRODUCTS, TEMPLATES } from "../data/products";
import { pad } from "../utils/format";

/**
 * Top hero with the campaign artwork, headline and the two CTAs.
 *
 * The `outline + gold-fill` treatment is the brand's signature — two
 * variants of the same word stacked on top of each other.
 */
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="hero">
      <div
        className="hero-ph"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.6) 60%, #0a0a0a 100%), url(${TEMPLATES.t3})`,
          backgroundPosition: "center 15%",
        }}
      />
      <div className="hero-bg" />

      <div className="hero-stats" aria-hidden="true">
        <span>FW 26 ✦ Vol. 04</span>
        <span style={{ color: "var(--gold)" }}>—</span>
        <span>14 Pieces ✦ Limited</span>
      </div>

      <div className="hero-content">
        <div className="hero-meta">
          <div className="row">
            <span className="dot" />
            FW 26 / Drop 04 — Now Live
          </div>
          <h1 className="hero-title">
            <span className="outline">Obsidian</span>
            <span className="gold-fill">Aurum</span>
            <span className="outline italic">&nbsp;ɴ º04</span>
          </h1>
        </div>
        <div className="hero-side">
          <p>
            A study in shadow and shine. Heavyweight knitwear, gold-cast hardware, and tailored
            silhouettes carved for the after-hours city.
          </p>
          <div className="hero-cta-row">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/shop/new")}
            >
              Shop the drop <Icon.Arrow />
            </button>
            <button type="button" className="btn" onClick={() => navigate("/lookbook")}>
              Lookbook
            </button>
          </div>
        </div>
      </div>

      <div className="scroll-cue">
        <span className="line" />
        Scroll
      </div>
    </section>
  );
}

/** Featured grid — the first 4 products of the catalogue. */
function FeaturedGrid() {
  const featured = PRODUCTS.slice(0, 4);
  return (
    <section className="section">
      <div className="section-head">
        <div>
          <div className="section-eyebrow">Featured ✦ Drop 04</div>
          <h2 className="section-title">
            Core <span className="gold">pieces</span>
          </h2>
        </div>
        <Link to="/shop/new" className="section-link">
          View all 14 pieces <Icon.Arrow />
        </Link>
      </div>

      <div className="product-grid">
        {featured.map((product, i) => (
          <Reveal key={product.id} delay={i * 80}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Editorial split: a tall image next to a campaign blurb. */
function Lookbook() {
  return (
    <section className="lookbook">
      <Reveal>
        <Placeholder
          label="LOOKBOOK · FRAME 03 · MIDNIGHT TAILORING"
          palette="warm"
          className="lookbook-img"
          img={TEMPLATES.t1}
        />
      </Reveal>
      <Reveal delay={120}>
        <div className="lookbook-text">
          <div className="section-eyebrow">Lookbook 04 ✦ Director Aleix</div>
          <h2 className="lookbook-title">
            <span className="outline">Born in the</span>
            <br />
            <span>City. </span>
            <span className="gold">Forged</span>
            <br />
            <span className="outline">in Gold.</span>
          </h2>
          <p>
            Shot across three nights in Barcelona, Lookbook 04 captures the FW26 collection as it
            lives — under sodium light, on slick streets, between last trains. Cast from our
            resident community of artists, athletes and night-walkers.
          </p>
          <div className="lookbook-meta">
            <div className="stat">
              <span className="val">14</span>Pieces
            </div>
            <div className="stat">
              <span className="val">03</span>Cities
            </div>
            <div className="stat">
              <span className="val">11</span>Cast
            </div>
          </div>
          <Link to="/lookbook" className="btn" style={{ alignSelf: "flex-start" }}>
            Enter Lookbook <Icon.Arrow />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

/**
 * Live countdown to the next drop.
 *
 * The target date is locked-in on mount via `useMemo` — otherwise it
 * would be re-computed every tick and the distance would never shrink,
 * freezing the counter. The interval is cleared on unmount.
 */
function DropStrip() {
  const target = useMemo(() => {
    const t = new Date();
    t.setDate(t.getDate() + 2);
    t.setHours(t.getHours() + 14);
    t.setMinutes(t.getMinutes() + 38);
    return t.getTime();
  }, []);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const distance = Math.max(0, target - now);
  const d = Math.floor(distance / (1000 * 60 * 60 * 24));
  const h = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const m = Math.floor((distance / (1000 * 60)) % 60);
  const s = Math.floor((distance / 1000) % 60);

  return (
    <section
      className="drop drop-bg"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.7) 50%, rgba(5,5,5,0.95) 100%), url(${BRAND.background2})`,
      }}
    >
      <div className="drop-inner">
        <div className="drop-label">
          <span className="tag">✦ Next Release</span>
          <span className="name">Drop 05 — Eclipse</span>
          <span className="sub">Members early access · 12h before public</span>
        </div>
        <div className="countdown">
          {[
            ["Days", d],
            ["Hours", h],
            ["Minutes", m],
            ["Seconds", s],
          ].map(([label, value]) => (
            <div className="unit" key={label}>
              <div className="num">{pad(Number(value))}</div>
              <div className="lbl">{label}</div>
            </div>
          ))}
        </div>
        <div className="drop-side">
          <button type="button" className="btn btn-primary">
            Notify me <Icon.Arrow />
          </button>
          <span className="waiting">12,847 waiting</span>
        </div>
      </div>
    </section>
  );
}

/** Three category cards (outerwear / knitwear / accessories). */
function Categories() {
  const cats = [
    { num: "01", name: "Outerwear", count: "4 pieces", palette: "warm", id: "outerwear", img: TEMPLATES.t6 },
    { num: "02", name: "Knitwear", count: "5 pieces", palette: "gold", id: "knitwear", img: TEMPLATES.t2 },
    { num: "03", name: "Accessories", count: "5 pieces", palette: "warm", id: "accessories", img: TEMPLATES.t5 },
  ] as const;

  return (
    <>
      <div className="section-head categories-head">
        <div>
          <div className="section-eyebrow">Categories ✦ FW26</div>
          <h2 className="section-title">
            Shop by <span className="gold">category</span>
          </h2>
        </div>
      </div>
      <div className="categories">
        {cats.map((c, i) => (
          <Reveal key={c.id} delay={i * 100}>
            <Link to={`/shop/${c.id}`} className="cat-card">
              <Placeholder
                palette={c.palette}
                corner={false}
                img={c.img}
              />
              <div className="overlay">
                <span className="num">{c.num} / 03</span>
                <span className="name">{c.name}</span>
                <span className="count">
                  <span>{c.count}</span>
                  <span className="arrow">
                    <Icon.Arrow />
                  </span>
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  );
}

/**
 * Full-bleed editorial section featuring the brand's signature street
 * shot. Sits between the lookbook and the countdown to break the
 * rhythm of grids with a single cinematic image.
 */
function BrandStatement() {
  const navigate = useNavigate();
  return (
    <Reveal>
      <section
        className="brand-statement"
        style={{ backgroundImage: `url(${BRAND.street})` }}
        aria-label="Obsidian — graffiti wall"
      >
        <div className="brand-statement-overlay">
          <div className="section-eyebrow">Obsidian ✦ In the wild</div>
          <h2 className="brand-statement-title">
            Worn <span className="gold">where</span> the
            <br />
            city forgets itself.
          </h2>
          <p>
            From sodium-lit alleys to last-train platforms — Obsidian lives where the day
            never quite makes it. Every piece numbered, every drop final.
          </p>
          <div className="brand-statement-cta">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/shop/new")}
            >
              Shop the drop <Icon.Arrow />
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => navigate("/lookbook")}
            >
              See the lookbook
            </button>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function QuoteStrip() {
  return (
    <Reveal>
      <section className="quote">
        <h2 className="quote-text">
          <span>"We don't dress for daylight. </span>
          <span className="gold">We dress</span>
          <span> for the hour after — </span>
          <br />
          <span>when the city </span>
          <span className="gold">forgets</span>
          <span> itself."</span>
        </h2>
        <div className="quote-byline">— Aleix Auqué, Creative Director</div>
      </section>
    </Reveal>
  );
}

/** Composed home page. */
export function Home() {
  return (
    <main className="fade-in">
      <Hero />

      <div className="announce" style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <Marquee
          items={[
            "Free shipping over €200",
            "FW 26 — Drop 04 Live Now",
            "Members early access",
            "Cast in gold · Worn after midnight",
            "Hand-finished in Los Angeles",
            "Limited to 200 units",
          ]}
        />
      </div>

      <FeaturedGrid />
      <Lookbook />
      <BrandStatement />
      <DropStrip />
      <Categories />
      <QuoteStrip />
    </main>
  );
}
