// ===========================================
// OBSIDIAN — PLP (Product Listing Page)
// ===========================================

const { useState: usePLPState } = React;

function PLP({ cat, setView, onAddToCart }) {
  const [size, setSize] = usePLPState(null);
  const [color, setColor] = usePLPState(null);
  const [sort, setSort] = usePLPState("featured");

  const titles = {
    new: { eyebrow: "FW 26 ✦ Drop 04 ✦ Live", title: <><span className="gold">New</span> arrivals</>, count: 14 },
    men: { eyebrow: "FW 26 ✦ Men", title: <>Men's <span className="gold">collection</span></>, count: 11 },
    women: { eyebrow: "FW 26 ✦ Women", title: <>Women's <span className="gold">collection</span></>, count: 9 },
    outerwear: { eyebrow: "FW 26 ✦ Category", title: <>Outerwear <span className="gold">&amp; coats</span></>, count: 4 },
    knitwear: { eyebrow: "FW 26 ✦ Category", title: <>Knitwear <span className="gold">essentials</span></>, count: 5 },
    accessories: { eyebrow: "FW 26 ✦ Category", title: <>Hardware <span className="gold">&amp; objects</span></>, count: 5 },
    archive: { eyebrow: "Archive ✦ Sale", title: <>The <span className="gold">archive</span></>, count: 22 },
  };
  const T = titles[cat] || titles.new;

  return (
    <main className="fade-in">
      <section className="plp-head">
        <div className="breadcrumb">
          <a onClick={() => setView({ name: "home" })}>Home</a>
          <span className="sep">/</span>
          <span>Shop</span>
          <span className="sep">/</span>
          <span className="here">{cat.toUpperCase()}</span>
        </div>
        <div className="title-row">
          <h1>{T.title}</h1>
          <div className="summary">
            <span className="num">{T.count}</span>
            {T.eyebrow}
          </div>
        </div>
      </section>

      <div className="plp-body">
        <aside className="filters">
          <div className="filter-group">
            <h4>Sort by <Icon.arrowDown /></h4>
            <ul className="filter-list">
              {["Featured", "Newest", "Price ↑", "Price ↓", "Best Sellers"].map((s, i) => (
                <li key={s}>
                  <label className={sort === s.toLowerCase() ? "active" : ""} onClick={() => setSort(s.toLowerCase())}>
                    <span className="box">{sort === s.toLowerCase() && <span style={{color:"#0a0a0a",fontSize:8}}>✓</span>}</span>
                    {s}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group">
            <h4>Category <span className="ct">7</span></h4>
            <ul className="filter-list">
              {[
                ["Outerwear", 4], ["Knitwear", 5], ["Tops", 6], ["Pants", 3],
                ["Footwear", 2], ["Accessories", 5], ["Jewelry", 3]
              ].map(([n, c]) => (
                <li key={n}>
                  <label>
                    <span className="box"></span>
                    {n}<span className="ct">{c}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group">
            <h4>Size</h4>
            <div className="size-chips">
              {["XS","S","M","L","XL","XXL","28","30","32","34"].map(s => (
                <button key={s}
                  className={size === s ? "active" : ""}
                  onClick={() => setSize(size === s ? null : s)}>{s}</button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Color</h4>
            <div className="color-chips">
              {[
                ["#0a0a0a", "Obsidian"],
                ["#c9a14a", "Gold"],
                ["#3a342a", "Tobacco"],
                ["#f5efe2", "Bone"],
                ["#5a4a2a", "Bronze"],
                ["#1a1818", "Charcoal"],
              ].map(([c, n]) => (
                <span key={c}
                  className={`color-chip ${color === c ? "active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setColor(color === c ? null : c)}
                  title={n}></span>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Price</h4>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 11,
              letterSpacing: "0.08em", color: "var(--gold)", marginBottom: 10
            }}>€75 — €890</div>
            <div style={{ position: "relative", height: 24 }}>
              <div style={{
                position: "absolute", top: 11, left: 0, right: 0, height: 2,
                background: "var(--line-2)"
              }}></div>
              <div style={{
                position: "absolute", top: 11, left: "10%", right: "20%", height: 2,
                background: "var(--gold)"
              }}></div>
              <div style={{
                position: "absolute", top: 6, left: "10%", width: 12, height: 12,
                background: "var(--gold)", border: "2px solid var(--bg)",
                borderRadius: "50%", transform: "translateX(-50%)"
              }}></div>
              <div style={{
                position: "absolute", top: 6, right: "20%", width: 12, height: 12,
                background: "var(--gold)", border: "2px solid var(--bg)",
                borderRadius: "50%", transform: "translateX(50%)"
              }}></div>
            </div>
          </div>

          <div className="filter-group">
            <h4>Drop</h4>
            <ul className="filter-list">
              <li><label className="active">
                <span className="box" style={{background:"var(--gold)",borderColor:"var(--gold)"}}><span style={{color:"#0a0a0a",fontSize:8}}>✓</span></span>
                FW 26 ✦ Drop 04 <span className="ct">14</span>
              </label></li>
              <li><label><span className="box"></span>FW 26 ✦ Drop 03<span className="ct">8</span></label></li>
              <li><label><span className="box"></span>SS 26 ✦ Drop 02<span className="ct">12</span></label></li>
            </ul>
          </div>

          <button style={{
            padding: "12px 16px", border: "1px solid var(--line-2)",
            fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em",
            textTransform: "uppercase", color: "var(--fg-dim)"
          }} onClick={() => { setSize(null); setColor(null); }}>
            Clear filters
          </button>
        </aside>

        <section>
          <div className="plp-toolbar">
            <div className="left">
              <span>14 results</span>
              {size && <span className="chip">Size: {size} ✕</span>}
              {color && <span className="chip">Color ✕</span>}
            </div>
            <div className="right">
              <select>
                <option>Sort: Featured</option>
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Best Sellers</option>
              </select>
            </div>
          </div>

          <div className="plp-grid">
            {PRODUCTS.map((p, i) => (
              <Reveal key={p.id} delay={i * 50}>
                <ProductCard
                  product={p}
                  onOpen={() => setView({ name: "pdp", product: p })}
                  onQuickAdd={() => onAddToCart(p)}
                />
              </Reveal>
            ))}
          </div>

          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center", gap: 16,
            padding: "60px 0", fontFamily: "var(--font-mono)", fontSize: 11,
            letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--fg-dim)"
          }}>
            <span>Showing 9 of 14</span>
            <div style={{ flex: 1, height: 1, background: "var(--line)", maxWidth: 240 }}>
              <div style={{ width: "64%", height: "100%", background: "var(--gold)" }}></div>
            </div>
            <button style={{ color: "var(--gold)", borderBottom: "1px solid var(--gold)", paddingBottom: 2 }}>
              Load more
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}

Object.assign(window, { PLP });
