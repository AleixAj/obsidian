// ===========================================
// OBSIDIAN — Home page
// ===========================================

const { useState: useHomeState, useEffect: useHomeEffect } = React;

function Hero({ onCTA }) {
  return (
    <section className="hero">
      <div className="hero-ph" style={{
        backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.55) 60%, #0a0a0a 100%), url(${IMAGES.hero})`,
        backgroundSize: "cover",
        backgroundPosition: "center 35%",
      }}></div>
      <div className="hero-bg"></div>

      {/* Stats vertical right */}
      <div className="hero-stats">
        <span>FW 26 ✦ Vol. 04</span>
        <span style={{ color: "var(--gold)" }}>—</span>
        <span>14 Pieces ✦ Limited</span>
      </div>

      <div className="hero-content">
        <div className="hero-meta">
          <div className="row">
            <span className="dot"></span>
            FW 26 / Drop 04 — Now Live
          </div>
          <h1 className="hero-title">
            <span className="outline">Obsidian</span>
            <span className="gold-fill">Aurum</span>
            <span className="outline" style={{ fontStyle: "italic", fontFamily: "serif", fontWeight: 400, fontSize: "0.7em" }}>&nbsp;ɴ º04</span>
          </h1>
        </div>
        <div className="hero-side">
          <p>A study in shadow and shine. Heavyweight knitwear, gold-cast hardware, and tailored silhouettes carved for the after-hours city.</p>
          <div className="hero-cta-row">
            <button className="btn btn-primary" onClick={onCTA}>
              Shop the drop <Icon.arrow />
            </button>
            <button className="btn">
              Lookbook
            </button>
          </div>
        </div>
      </div>

      <div className="scroll-cue">
        <span className="line"></span>
        Scroll
      </div>
    </section>
  );
}

function FeaturedGrid({ onOpenProduct, onAddToCart }) {
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
        <a className="section-link" onClick={() => onOpenProduct(null)}>
          View all 14 pieces <Icon.arrow />
        </a>
      </div>

      <div className="product-grid">
        {featured.map((p, i) => (
          <Reveal key={p.id} delay={i * 80}>
            <ProductCard product={p} onOpen={() => onOpenProduct(p)} onQuickAdd={() => onAddToCart(p)} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product, onOpen, onQuickAdd }) {
  return (
    <article className="product-card" onClick={onOpen}>
      <div className="product-img">
        {product.tag && (
          <span className={`product-tag ${product.tag.startsWith("−") ? "" : (product.tag === "LAST UNITS" ? "dark" : "")}`}>
            {product.tag}
          </span>
        )}
        <Placeholder label={`${product.id.toUpperCase()} · Front`} palette={product.palette} className="main" img={product.img} />
        <Placeholder label={`${product.id.toUpperCase()} · Back`} palette={product.palette === "gold" ? "warm" : "gold"} className="alt" img={product.imgAlt} />
        <button className="quick-add" onClick={(e) => { e.stopPropagation(); onQuickAdd(); }}>
          Quick add ✦ {formatPrice(product.price)}
        </button>
      </div>
      <div className="product-info">
        <div>
          <div className="name">{product.name}</div>
          <div className="cat">{product.cat}</div>
          <div className="swatches">
            {product.colors.map((c, i) => (
              <span key={i} className="swatch" style={{ background: c }}></span>
            ))}
          </div>
        </div>
        <div className="price">
          {product.old && <span className="old">{formatPrice(product.old)}</span>}
          {formatPrice(product.price)}
        </div>
      </div>
    </article>
  );
}

function Lookbook() {
  return (
    <section className="lookbook">
      <Reveal>
        <Placeholder label="LOOKBOOK · FRAME 03 · MIDNIGHT TAILORING" palette="warm" className="lookbook-img" img={IMAGES.lookbook} />
      </Reveal>
      <Reveal delay={120}>
        <div className="lookbook-text">
          <div className="section-eyebrow">Lookbook 04 ✦ Director Wo</div>
          <h2 className="lookbook-title">
            <span className="outline">Born in the</span>
            <br />
            <span>City. </span>
            <span className="gold">Forged</span>
            <br />
            <span className="outline">in Gold.</span>
          </h2>
          <p>
            Shot across three nights in Berlin, Lookbook 04 captures the FW26 collection as
            it lives — under sodium light, on slick streets, between last trains. Cast from
            our resident community of artists, athletes and night-walkers.
          </p>
          <div className="lookbook-meta">
            <div className="stat"><span className="val">14</span>Pieces</div>
            <div className="stat"><span className="val">03</span>Cities</div>
            <div className="stat"><span className="val">11</span>Cast</div>
          </div>
          <button className="btn" style={{ alignSelf: "flex-start" }}>
            Enter Lookbook <Icon.arrow />
          </button>
        </div>
      </Reveal>
    </section>
  );
}

function DropStrip() {
  const [time, setTime] = useHomeState({ d: 2, h: 14, m: 38, s: 21 });
  useHomeEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { d, h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; d--; }
        if (d < 0) { d = 0; h = 0; m = 0; s = 0; }
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <section className="drop">
      <div className="drop-inner">
        <div className="drop-label">
          <span className="tag">✦ Next Release</span>
          <span className="name">Drop 05 — Eclipse</span>
          <span style={{ color: "var(--fg-dim)", fontSize: 13, marginTop: 4 }}>
            Members early access · 12h before public
          </span>
        </div>
        <div className="countdown">
          <div className="unit"><div className="num">{pad(time.d)}</div><div className="lbl">Days</div></div>
          <div className="unit"><div className="num">{pad(time.h)}</div><div className="lbl">Hours</div></div>
          <div className="unit"><div className="num">{pad(time.m)}</div><div className="lbl">Minutes</div></div>
          <div className="unit"><div className="num">{pad(time.s)}</div><div className="lbl">Seconds</div></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="btn btn-primary">
            Notify me <Icon.arrow />
          </button>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--fg-dim)", textAlign: "center"
          }}>
            12,847 waiting
          </span>
        </div>
      </div>
    </section>
  );
}

function Categories({ onClick }) {
  const cats = [
    { num: "01", name: "Outerwear", count: "4 pieces", palette: "warm", id: "outerwear", img: IMAGES.catOuterwear },
    { num: "02", name: "Knitwear", count: "5 pieces", palette: "gold", id: "knitwear", img: IMAGES.catKnitwear },
    { num: "03", name: "Accessories", count: "5 pieces", palette: "warm", id: "accessories", img: IMAGES.catAccessories },
  ];
  return (
    <>
      <div className="section-head" style={{ padding: "100px 32px 0", marginBottom: 24 }}>
        <div>
          <div className="section-eyebrow">Categories ✦ FW26</div>
          <h2 className="section-title">Shop by <span className="gold">category</span></h2>
        </div>
      </div>
      <div className="categories">
        {cats.map((c, i) => (
          <Reveal key={c.id} delay={i * 100}>
            <div className="cat-card" onClick={() => onClick(c.id)}>
              <Placeholder label={`${c.name.toUpperCase()} EDITORIAL`} palette={c.palette} corner={true} img={c.img} />
              <div className="overlay">
                <span className="num">{c.num} / 03</span>
                <span className="name">{c.name}</span>
                <span className="count">
                  <span>{c.count}</span>
                  <span className="arrow"><Icon.arrow /></span>
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </>
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
        <div className="quote-byline">— Wo Müller, Creative Director</div>
      </section>
    </Reveal>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="logo">
            <span className="logo-mark-eclipse">
              <span className="ec-outer"></span>
              <span className="ec-inner"></span>
            </span>
            <span>OBSIDIAN</span>
          </div>
          <p>
            Heavyweight goods cast in gold. Designed in Berlin, made in Portugal,
            worn after midnight in every city that matters.
          </p>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><a>New In</a></li>
            <li><a>Outerwear</a></li>
            <li><a>Knitwear</a></li>
            <li><a>Accessories</a></li>
            <li><a>Archive Sale</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>About</h4>
          <ul>
            <li><a>Story</a></li>
            <li><a>Lookbook</a></li>
            <li><a>Materials</a></li>
            <li><a>Stockists</a></li>
            <li><a>Journal</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Service</h4>
          <ul>
            <li><a>Shipping</a></li>
            <li><a>Returns</a></li>
            <li><a>Size guide</a></li>
            <li><a>Contact</a></li>
            <li><a>FAQ</a></li>
          </ul>
        </div>
        <div className="footer-col footer-newsletter">
          <h4>Join the Inner Circle</h4>
          <p style={{ color: "var(--fg-dim)", fontSize: 13, marginBottom: 16 }}>
            Early access to drops, exclusive pieces, and private events.
          </p>
          <input type="email" placeholder="your@email.com" />
          <button>Subscribe →</button>
        </div>
      </div>

      <div className="footer-mark">OBSIDIAN</div>

      <div className="footer-bottom">
        <span>© 2026 Obsidian Studio · Berlin / Porto / Tokyo</span>
        <div className="links">
          <a>Privacy</a>
          <a>Terms</a>
          <a>Cookies</a>
          <a>Instagram ↗</a>
          <a>TikTok ↗</a>
        </div>
      </div>
    </footer>
  );
}

function HomePage({ setView, onAddToCart }) {
  return (
    <main className="fade-in">
      <Hero onCTA={() => setView({ name: "plp", cat: "new" })} />

      <div className="announce" style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <Marquee speed="" items={[
          "Free shipping over €200",
          "FW 26 — Drop 04 Live Now",
          "Members early access",
          "Cast in gold · Worn after midnight",
          "Hand-finished in Porto",
          "Limited to 200 units",
        ]} />
      </div>

      <FeaturedGrid
        onOpenProduct={(p) => setView({ name: p ? "pdp" : "plp", product: p, cat: "new" })}
        onAddToCart={onAddToCart}
      />

      <Lookbook />

      <DropStrip />

      <Categories onClick={(id) => setView({ name: "plp", cat: id })} />

      <QuoteStrip />

      <Footer />
    </main>
  );
}

Object.assign(window, { HomePage, ProductCard });
