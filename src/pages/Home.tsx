import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { ProductCard } from "../components/product/ProductCard";
import { ProductGridSkeleton } from "../components/product/ProductCardSkeleton";
import { Icon } from "../components/ui/Icon";
import { Marquee } from "../components/ui/Marquee";
import { Placeholder } from "../components/ui/Placeholder";
import { Reveal } from "../components/ui/Reveal";
import { compareNewCollectionOrder } from "../constants/catalog";
import { BRAND, TEMPLATES } from "../data/products";
import { useProducts } from "../hooks/queries";
import { pad } from "../utils/format";

/**
 * Top hero with the campaign artwork, headline and the two CTAs.
 *
 * The `outline + gold-fill` treatment is the brand's signature — two
 * variants of the same word stacked on top of each other.
 */
function Hero() {
  const { t } = useTranslation("shop");
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
        <span>{t("home.hero.stats1")}</span>
        <span style={{ color: "var(--gold)" }}>—</span>
        <span>{t("home.hero.stats2")}</span>
      </div>

      <div className="hero-content">
        <div className="hero-meta">
          <div className="row">
            <span className="dot" />
            {t("home.hero.live")}
          </div>
          <h1 className="hero-title">
            <span className="outline">Obsidian</span>
            <span className="gold-fill">Aurum</span>
            <span className="outline italic">&nbsp;ɴ º04</span>
          </h1>
        </div>
        <div className="hero-side">
          <p>{t("home.hero.text")}</p>
          <div className="hero-cta-row">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/shop/new")}
            >
              {t("cta.shopDrop")} <Icon.Arrow />
            </button>
            <button type="button" className="btn" onClick={() => navigate("/lookbook")}>
              {t("home.hero.lookbook")}
            </button>
          </div>
        </div>
      </div>

      <div className="scroll-cue">
        <span className="line" />
        {t("home.hero.scroll")}
      </div>
    </section>
  );
}

/** Featured grid — the first 4 products of the catalogue. */
function FeaturedGrid() {
  const { t } = useTranslation("shop");
  const { data: products, isPending, isError, refetch } = useProducts("new");
  const featured = useMemo(
    () =>
      products
        ? [...products]
            .sort(compareNewCollectionOrder)
            .slice(0, 4)
        : [],
    [products],
  );

  return (
    <section className="section">
      <div className="section-head">
        <div>
          <div className="section-eyebrow">{t("home.featured.eyebrow")}</div>
          <h2 className="section-title">
            {t("home.featured.title")} <span className="gold">{t("home.featured.titleGold")}</span>
          </h2>
        </div>
        <Link to="/shop/new" className="section-link">
          {t("cta.viewAll")} <Icon.Arrow />
        </Link>
      </div>

      {isPending ? (
        <ProductGridSkeleton count={4} />
      ) : isError ? (
        <div className="data-error">
          <div className="title">{t("home.featured.error")}</div>
          <div>{t("errors.apiDown")}</div>
          <button
            type="button"
            className="btn"
            style={{ marginTop: 16 }}
            onClick={() => refetch()}
          >
            {t("errors.retry")} <Icon.Arrow />
          </button>
          <div className="hint">{t("errors.hint")}</div>
        </div>
      ) : (
        <div className="product-grid">
          {featured.map((product, i) => (
            <Reveal key={product.id} delay={i * 80}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

/** Editorial split: a tall image next to a campaign blurb. */
function Lookbook() {
  const { t } = useTranslation("shop");
  return (
    <section className="lookbook">
      <Reveal>
        <Placeholder
          label={t("home.lookbook.frame")}
          palette="warm"
          className="lookbook-img"
          img={TEMPLATES.t1}
        />
      </Reveal>
      <Reveal delay={120}>
        <div className="lookbook-text">
          <div className="section-eyebrow">{t("home.lookbook.eyebrow")}</div>
          <h2 className="lookbook-title">
            <span className="outline">{t("home.lookbook.line1")}</span>
            <br />
            <span>{t("home.lookbook.line2")}</span>
            <span className="gold">{t("home.lookbook.line3")}</span>
            <br />
            <span className="outline">{t("home.lookbook.line4")}</span>
          </h2>
          <p>{t("lookbook.intro")}</p>
          <div className="lookbook-meta">
            <div className="stat">
              <span className="val">14</span>{t("home.lookbook.pieces")}
            </div>
            <div className="stat">
              <span className="val">03</span>{t("home.lookbook.cities")}
            </div>
            <div className="stat">
              <span className="val">11</span>{t("home.lookbook.cast")}
            </div>
          </div>
          <Link to="/lookbook" className="btn" style={{ alignSelf: "flex-start" }}>
            {t("home.lookbook.enter")} <Icon.Arrow />
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
  const { t } = useTranslation("shop");
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
          <span className="tag">{t("home.drop.tag")}</span>
          <span className="name">{t("home.drop.name")}</span>
          <span className="sub">{t("home.drop.sub")}</span>
        </div>
        <div className="countdown">
          {[
            [t("home.drop.days"), d],
            [t("home.drop.hours"), h],
            [t("home.drop.minutes"), m],
            [t("home.drop.seconds"), s],
          ].map(([label, value]) => (
            <div className="unit" key={label}>
              <div className="num">{pad(Number(value))}</div>
              <div className="lbl">{label}</div>
            </div>
          ))}
        </div>
        <div className="drop-side">
          <button type="button" className="btn btn-primary">
            {t("home.drop.notify")} <Icon.Arrow />
          </button>
          <span className="waiting">{t("home.drop.waiting")}</span>
        </div>
      </div>
    </section>
  );
}

/** Three category cards (outerwear / knitwear / accessories). */
function Categories() {
  const { t } = useTranslation("shop");
  // `name` is a translation key (home.categories.*), `count` is the number of pieces.
  const cats = [
    { num: "01", name: "outerwear", count: 4, palette: "warm", id: "outerwear", img: TEMPLATES.t6 },
    { num: "02", name: "knitwear", count: 5, palette: "gold", id: "knitwear", img: TEMPLATES.t2 },
    { num: "03", name: "accessories", count: 5, palette: "warm", id: "accessories", img: TEMPLATES.t5 },
  ] as const;

  return (
    <>
      <div className="section-head categories-head">
        <div>
          <div className="section-eyebrow">{t("home.categories.eyebrow")}</div>
          <h2 className="section-title">
            {t("home.categories.title")} <span className="gold">{t("home.categories.titleGold")}</span>
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
                <span className="name">{t(`home.categories.${c.name}`)}</span>
                <span className="count">
                  <span>{t("home.categories.pieces", { count: c.count })}</span>
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
  const { t } = useTranslation("shop");
  const navigate = useNavigate();
  return (
    <Reveal>
      <section
        className="brand-statement"
        style={{ backgroundImage: `url(${BRAND.street})` }}
        aria-label={t("home.statement.label")}
      >
        <div className="brand-statement-overlay">
          <div className="section-eyebrow">{t("home.statement.eyebrow")}</div>
          <h2 className="brand-statement-title">
            {t("home.statement.before")} <span className="gold">{t("home.statement.gold")}</span>{" "}
            {t("home.statement.after")}
            <br />
            {t("home.statement.line2")}
          </h2>
          <p>{t("home.statement.text")}</p>
          <div className="brand-statement-cta">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/shop/new")}
            >
              {t("cta.shopDrop")} <Icon.Arrow />
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => navigate("/lookbook")}
            >
              {t("home.statement.seeLookbook")}
            </button>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function QuoteStrip() {
  const { t } = useTranslation("shop");
  return (
    <Reveal>
      <section className="quote">
        <h2 className="quote-text">
          <span>{t("home.quote.part1")}</span>
          <span className="gold">{t("home.quote.gold1")}</span>
          <span>{t("home.quote.part2")}</span>
          <br />
          <span>{t("home.quote.part3")}</span>
          <span className="gold">{t("home.quote.gold2")}</span>
          <span>{t("home.quote.part4")}</span>
        </h2>
        <div className="quote-byline">{t("home.quote.byline")}</div>
      </section>
    </Reveal>
  );
}

/** Composed home page. */
export function Home() {
  const { t } = useTranslation("shop");
  return (
    <main className="fade-in">
      <Hero />

      <div className="announce" style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <Marquee
          items={[
            t("home.marquee.shipping"),
            t("home.marquee.live"),
            t("home.marquee.early"),
            t("home.marquee.cast"),
            t("home.marquee.handFinished"),
            t("home.marquee.limited"),
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
