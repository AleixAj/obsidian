// ===========================================
// OBSIDIAN — PDP (Product Detail Page)
// ===========================================

const { useState: usePDPState } = React;

function PDP({ product, setView, onAddToCart, wishlist = [], toggleWishlist = () => {} }) {
  const p = product || PRODUCTS[0];
  const [activeImg, setActiveImg] = usePDPState(0);
  const [size, setSize] = usePDPState(null);
  const [colorIdx, setColorIdx] = usePDPState(0);
  const [open, setOpen] = usePDPState("details");

  const images = ["FRONT", "BACK", "DETAIL", "ON BODY"];

  return (
    <main className="fade-in pdp">
      <div className="pdp-breadcrumb">
        <a onClick={() => setView({ name: "home" })}>Home</a>
        <span className="sep">/</span>
        <a onClick={() => setView({ name: "plp", cat: "new" })}>{p.cat.split("·")[0].trim()}</a>
        <span className="sep">/</span>
        <span className="here">{p.name}</span>
      </div>

      <div className="pdp-grid">
        {/* Gallery */}
        <div className="pdp-gallery">
          <div className="thumbs">
            {images.map((label, i) => (
              <div key={i}
                className={`thumb ${activeImg === i ? "active" : ""}`}
                onClick={() => setActiveImg(i)}>
                <Placeholder label="" palette={p.palette} corner={false} img={i % 2 === 0 ? p.img : p.imgAlt} />
              </div>
            ))}
          </div>
          <div className="main-img">
            <span className="zoom"><Icon.zoom /> Zoom ✦ Drag</span>
            <Placeholder
              label={`${p.id.toUpperCase()} ✦ ${images[activeImg]}`}
              palette={activeImg % 2 === 0 ? p.palette : (p.palette === "gold" ? "warm" : "gold")}
              img={activeImg % 2 === 0 ? p.img : p.imgAlt}
            />
          </div>
        </div>

        {/* Info */}
        <div className="pdp-info">
          <div className="pdp-meta">
            <span className="dot"></span>
            {p.tag || "FW26 ✦ Drop 04"} · In Stock
          </div>

          <h1 className="pdp-title">{p.name}</h1>

          <div className="pdp-price">
            <span>{formatPrice(p.price)}</span>
            {p.old && (
              <>
                <span className="old">{formatPrice(p.old)}</span>
                <span className="save">Save {Math.round((1 - p.price / p.old) * 100)}%</span>
              </>
            )}
          </div>

          <p className="pdp-desc">
            Cut from 580 gsm Portuguese loopback cotton, garment-dyed for depth and faded into a
            charcoal patina. Brass eyelets, custom 24k-plated zip pull, and an inner lining
            embroidered with the Obsidian sigil. Built to outlast every winter you have left.
          </p>

          <div className="pdp-section">
            <h4>
              <span>Color · <span style={{ color: "var(--gold)" }}>
                {["Obsidian", "Gold Cast", "Tobacco"][colorIdx] || "Obsidian"}
              </span></span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-dim)" }}>
                {p.colors.length} colors
              </span>
            </h4>
            <div className="color-row">
              {p.colors.map((c, i) => (
                <span key={i}
                  className={`chip ${colorIdx === i ? "active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setColorIdx(i)}></span>
              ))}
            </div>
          </div>

          <div className="pdp-section">
            <h4>
              <span>Size {size && <span style={{color:"var(--gold)"}}>· {size}</span>}</span>
              <span className="extra">Size guide ↗</span>
            </h4>
            <div className="size-row">
              {p.sizes.map(s => (
                <button key={s}
                  className={size === s ? "active" : ""}
                  disabled={p.sold_out.includes(s)}
                  onClick={() => setSize(s)}>
                  {s}
                </button>
              ))}
            </div>
            {p.sold_out.length > 0 && (
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "var(--fg-mute)", marginTop: 10
              }}>
                {p.sold_out.join(", ")} sold out · Notify me ↗
              </div>
            )}
          </div>

          <div className="pdp-cta-row">
            <button
              className="btn btn-primary"
              onClick={() => onAddToCart({ ...p, size: size || p.sizes[0], colorName: ["Obsidian", "Gold Cast", "Tobacco"][colorIdx] })}>
              {size ? "Add to bag" : "Select size"} <Icon.arrow />
            </button>
            <button
              className="icon-btn"
              title="Wishlist"
              onClick={() => toggleWishlist(p.id)}
              style={wishlist.includes(p.id) ? { borderColor: "var(--gold)", color: "var(--gold)" } : {}}>
              <Icon.heart />
            </button>
          </div>

          <div className="pdp-perks">
            <div className="perk">
              <span className="lbl">✦ Shipping</span>
              <span className="val">Free over €200 · 2-day EU</span>
            </div>
            <div className="perk">
              <span className="lbl">✦ Returns</span>
              <span className="val">30 days · No questions asked</span>
            </div>
            <div className="perk">
              <span className="lbl">✦ Made in</span>
              <span className="val">Porto, Portugal · Hand-finished</span>
            </div>
            <div className="perk">
              <span className="lbl">✦ Material</span>
              <span className="val">580gsm Portuguese loopback</span>
            </div>
          </div>

          <div className="pdp-accordion" style={{ marginTop: 8 }}>
            {[
              { id: "details", h: "Composition & Care", b: "100% organic Portuguese cotton, 580gsm. Garment-dyed and stone-washed for depth. Wash inside-out at 30°C with similar tones. Reshape and dry flat. Avoid direct sunlight when drying — the gold fades faster than you do." },
              { id: "fit", h: "Fit & Sizing", b: "Relaxed boxy fit through the body with a dropped shoulder. Model is 184cm, wearing size M. Garment is true-to-size — size down for a closer cut. Hem sits 4cm below the natural waist on the size M." },
              { id: "ship", h: "Shipping & Returns", b: "Free EU shipping on orders above €200. 2-3 business days with DHL Express. Free returns within 30 days — original tags must be attached. Final sale items marked at checkout." },
              { id: "story", h: "The Story", b: "Drop 04 ✦ Aurum is our heaviest collection to date. Designed in Berlin between February and May, sampled in Porto with our partners since 2022. Limited to 200 units per piece — each tagged with its own number." },
            ].map(item => (
              <div key={item.id}
                className={`acc-item ${open === item.id ? "open" : ""}`}
                onClick={() => setOpen(open === item.id ? null : item.id)}>
                <div className="acc-head">
                  <span>{item.h}</span>
                  <span className="plus"><Icon.plus /></span>
                </div>
                <div className="acc-body">{item.b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complete the look */}
      <section className="complete">
        <div className="section-head">
          <div>
            <div className="section-eyebrow">Styled with ✦ Recommended</div>
            <h2 className="section-title">Complete <span className="gold">the look</span></h2>
          </div>
          <a className="section-link">View all <Icon.arrow /></a>
        </div>
        <div className="product-grid">
          {PRODUCTS.filter(x => x.id !== p.id).slice(0, 4).map((rp, i) => (
            <Reveal key={rp.id} delay={i * 60}>
              <ProductCard
                product={rp}
                onOpen={() => { setView({ name: "pdp", product: rp }); window.scrollTo({ top: 0, behavior: "instant" }); }}
                onQuickAdd={() => onAddToCart(rp)}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

Object.assign(window, { PDP });
