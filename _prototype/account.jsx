// ===========================================
// OBSIDIAN — Account Dashboard
// ===========================================

const { useState: useAccState } = React;

const MOCK_ORDERS = [
  {
    id: "OBS-2641-OBS",
    date: "Nov 18, 2026",
    status: "transit",
    statusLabel: "In transit",
    total: 820,
    items: 2,
    products: [0, 1],
    eta: "2 days · DHL Express",
  },
  {
    id: "OBS-2588-AUR",
    date: "Nov 02, 2026",
    status: "delivered",
    statusLabel: "Delivered",
    total: 420,
    items: 1,
    products: [8],
    eta: "Delivered Nov 04",
  },
  {
    id: "OBS-2511-CRE",
    date: "Oct 14, 2026",
    status: "delivered",
    statusLabel: "Delivered",
    total: 605,
    items: 2,
    products: [3, 7],
    eta: "Delivered Oct 17",
  },
  {
    id: "OBS-2402-VES",
    date: "Sep 28, 2026",
    status: "delivered",
    statusLabel: "Delivered",
    total: 890,
    items: 1,
    products: [4],
    eta: "Delivered Oct 01",
  },
  {
    id: "OBS-2380-HAL",
    date: "Sep 12, 2026",
    status: "cancelled",
    statusLabel: "Refunded",
    total: 285,
    items: 1,
    products: [3],
    eta: "Refunded Sep 15",
  },
];

const MOCK_ADDRESSES = [
  {
    id: 1,
    label: "Home",
    name: "Wo Müller",
    lines: ["Skalitzer Str. 134", "10999 Berlin", "Germany", "+49 30 1234 5678"],
    default: true,
  },
  {
    id: 2,
    label: "Studio",
    name: "Obsidian Studio",
    lines: ["Brunnenstraße 9", "10119 Berlin", "Germany", "+49 30 9876 5432"],
    default: false,
  },
];

function AccountSidebar({ section, setSection, wishlistCount, onSignOut }) {
  const items = [
    { id: "overview", label: "Overview", ct: null },
    { id: "orders", label: "Orders", ct: MOCK_ORDERS.length },
    { id: "wishlist", label: "Wishlist", ct: wishlistCount },
    { id: "addresses", label: "Addresses", ct: MOCK_ADDRESSES.length },
    { id: "settings", label: "Settings", ct: null },
    { id: "rewards", label: "Inner Circle", ct: "✦" },
  ];
  return (
    <aside className="account-side">
      <div className="user">
        <div className="avatar">WM</div>
        <div>
          <div className="name">Wo Müller</div>
          <div className="tier">
            <span style={{ width: 5, height: 5, background: "var(--gold)", borderRadius: "50%", boxShadow: "0 0 6px var(--gold)" }}></span>
            Inner Circle · Gold
          </div>
        </div>
      </div>
      <ul className="account-nav">
        {items.map(item => (
          <li key={item.id}>
            <button className={section === item.id ? "active" : ""} onClick={() => setSection(item.id)}>
              <span>{item.label}</span>
              {item.ct != null && <span className="ct">{item.ct}</span>}
            </button>
          </li>
        ))}
        <li style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
          <button onClick={onSignOut} style={{ color: "var(--fg-mute)" }}>
            Sign out
            <span style={{ color: "var(--fg-mute)" }}>↗</span>
          </button>
        </li>
      </ul>
    </aside>
  );
}

function Overview({ setSection, setView, wishlist }) {
  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span style={{ width: 6, height: 6, background: "var(--gold)", borderRadius: "50%", boxShadow: "0 0 8px var(--gold)" }}></span>
            Member since 2024 ✦ Gold Tier
          </div>
          <h1>
            <span>Welcome back, </span>
            <span className="gold">Wo</span>
            <span>.</span>
          </h1>
        </div>
        <div className="ts">
          ✦ Last login<br />
          Today · 22:14 Berlin
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="lbl">Total orders</span>
          <span className="val">14</span>
          <span className="delta">+2 this season</span>
        </div>
        <div className="stat-card gold">
          <span className="lbl">Lifetime spend</span>
          <span className="val">€6,420</span>
          <span className="delta">Gold tier unlocked</span>
        </div>
        <div className="stat-card">
          <span className="lbl">Reward points</span>
          <span className="val">2,180</span>
          <span className="delta">+€48 credit available</span>
        </div>
        <div className="stat-card">
          <span className="lbl">Wishlist</span>
          <span className="val">{wishlist.length}</span>
          <span className="delta">3 back in stock</span>
        </div>
      </div>

      <div className="tier-banner">
        <div className="info">
          <span className="tag">
            <span style={{ width: 6, height: 6, background: "var(--gold)", borderRadius: "50%", boxShadow: "0 0 8px var(--gold)" }}></span>
            Inner Circle ✦ Gold
          </span>
          <h3>You're €580 from Onyx tier.</h3>
          <p>
            Onyx unlocks 24h early access to every drop, a personal stylist via WhatsApp,
            and the FW26 archive jacket as a welcome gift. Limited to 200 members worldwide.
          </p>
        </div>
        <div className="progress">
          <div className="meta"><span className="gold">€6,420</span> / €7,000</div>
          <div className="bar"><div></div></div>
          <div className="meta">68% to Onyx</div>
        </div>
      </div>

      <div className="acc-section-head">
        <h3>Recent orders <span className="ct">— Last 30 days</span></h3>
        <button className="section-link" onClick={() => setSection("orders")}>
          View all <Icon.arrow />
        </button>
      </div>
      <div className="orders-list">
        {MOCK_ORDERS.slice(0, 3).map(o => <OrderRow key={o.id} order={o} />)}
      </div>

      <div className="acc-section-head" style={{ marginTop: 48 }}>
        <h3>Wishlist <span className="ct">— Saved pieces</span></h3>
        <button className="section-link" onClick={() => setSection("wishlist")}>
          View all <Icon.arrow />
        </button>
      </div>
      <div className="wishlist-grid">
        {wishlist.slice(0, 3).map(id => {
          const p = PRODUCTS.find(x => x.id === id);
          if (!p) return null;
          return <WishCard key={p.id} product={p} onOpen={() => setView({ name: "pdp", product: p })} onRemove={() => {}} onAdd={() => {}} />;
        })}
      </div>
    </>
  );
}

function OrderRow({ order }) {
  return (
    <div className="order-card">
      <div className="stack">
        {order.products.slice(0, 3).map((pi, i) => {
          const p = PRODUCTS[pi];
          return p ? (
            <div key={i} className="thumb">
              <Placeholder palette={p.palette} corner={false} img={p.img} />
            </div>
          ) : null;
        })}
      </div>
      <div>
        <div className="id">Order <span className="num">#{order.id}</span></div>
        <div className="name">{order.items} {order.items > 1 ? "pieces" : "piece"} · {order.date}</div>
        <div className="info">{order.eta}</div>
      </div>
      <div className={`status-pill ${order.status}`}>
        <span className="dot"></span>
        {order.statusLabel}
      </div>
      <div className="total">{formatPrice(order.total)}</div>
      <button className="arrow-btn"><Icon.arrow /></button>
    </div>
  );
}

function Orders() {
  const [filter, setFilter] = useAccState("all");
  const filtered = filter === "all" ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.status === filter);
  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span style={{ width: 6, height: 6, background: "var(--gold)", borderRadius: "50%" }}></span>
            ✦ {MOCK_ORDERS.length} orders · €3,020 total
          </div>
          <h1>Your <span className="gold">orders</span></h1>
        </div>
      </div>

      <div className="plp-toolbar" style={{ borderTop: "none", paddingTop: 0 }}>
        <div className="left">
          {[
            ["all", `All (${MOCK_ORDERS.length})`],
            ["transit", "In transit (1)"],
            ["delivered", "Delivered (3)"],
            ["cancelled", "Refunded (1)"],
          ].map(([k, l]) => (
            <button key={k}
              onClick={() => setFilter(k)}
              style={{
                color: filter === k ? "var(--gold)" : "var(--fg-dim)",
                borderBottom: filter === k ? "1px solid var(--gold)" : "1px solid transparent",
                paddingBottom: 4
              }}>
              {l}
            </button>
          ))}
        </div>
        <div className="right">
          <select>
            <option>Sort: Newest</option>
            <option>Sort: Oldest</option>
            <option>Sort: Amount ↑</option>
            <option>Sort: Amount ↓</option>
          </select>
        </div>
      </div>

      <div className="orders-list">
        {filtered.map(o => <OrderRow key={o.id} order={o} />)}
      </div>
    </>
  );
}

function WishCard({ product, onOpen, onRemove, onAdd }) {
  return (
    <article className="wish-card">
      <div className="img">
        <button className="heart-btn" onClick={(e) => { e.stopPropagation(); onRemove(); }} title="Remove from wishlist">
          <Icon.heart />
        </button>
        <Placeholder palette={product.palette} corner={true} img={product.img} label={product.id.toUpperCase()} />
      </div>
      <div className="info">
        <div onClick={onOpen} style={{ cursor: "pointer" }}>
          <div className="name">{product.name}</div>
          <div className="cat">{product.cat} · {formatPrice(product.price)}</div>
        </div>
        <div className="actions">
          <button className="btn-add" onClick={onAdd}>Add to bag — {formatPrice(product.price)}</button>
          <button className="remove" title="Remove" onClick={onRemove}><Icon.close /></button>
        </div>
      </div>
    </article>
  );
}

function Wishlist({ wishlist, setWishlist, setView, onAddToCart }) {
  if (wishlist.length === 0) {
    return (
      <>
        <div className="account-hello">
          <div>
            <div className="eyebrow"><span style={{ width: 6, height: 6, background: "var(--gold)", borderRadius: "50%" }}></span> ✦ Saved pieces</div>
            <h1>Your <span className="gold">wishlist</span></h1>
          </div>
        </div>
        <div className="empty-state">
          <div className="icon"><Icon.heart /></div>
          <h4>Nothing saved yet</h4>
          <p>Tap the heart on any piece to save it here. We'll let you know when items go on sale or come back in stock.</p>
          <button className="btn btn-primary" onClick={() => setView({ name: "plp", cat: "new" })}>
            Explore the drop <Icon.arrow />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span style={{ width: 6, height: 6, background: "var(--gold)", borderRadius: "50%" }}></span>
            ✦ {wishlist.length} saved · 3 back in stock
          </div>
          <h1>Your <span className="gold">wishlist</span></h1>
        </div>
        <button className="btn">Share wishlist ↗</button>
      </div>

      <div className="wishlist-grid">
        {wishlist.map(id => {
          const p = PRODUCTS.find(x => x.id === id);
          if (!p) return null;
          return (
            <WishCard key={p.id}
              product={p}
              onOpen={() => setView({ name: "pdp", product: p })}
              onRemove={() => setWishlist(prev => prev.filter(x => x !== id))}
              onAdd={() => onAddToCart(p)}
            />
          );
        })}
      </div>
    </>
  );
}

function Addresses() {
  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span style={{ width: 6, height: 6, background: "var(--gold)", borderRadius: "50%" }}></span>
            ✦ Shipping &amp; billing
          </div>
          <h1>Your <span className="gold">addresses</span></h1>
        </div>
      </div>

      <div className="addr-grid">
        {MOCK_ADDRESSES.map(a => (
          <div key={a.id} className={`addr-card ${a.default ? "default" : ""}`}>
            {a.default && <span className="badge">Default</span>}
            <h4>{a.label}</h4>
            <div className="name">{a.name}</div>
            <div className="lines">
              {a.lines.map((l, i) => <div key={i}>{l}</div>)}
            </div>
            <div className="actions">
              <a>Edit</a>
              {!a.default && <a>Set default</a>}
              <a style={{ color: "var(--accent-warn)" }}>Remove</a>
            </div>
          </div>
        ))}
        <div className="addr-card add-new">
          <span className="plus-big">+</span>
          <span>Add new address</span>
        </div>
      </div>
    </>
  );
}

function Settings() {
  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span style={{ width: 6, height: 6, background: "var(--gold)", borderRadius: "50%" }}></span>
            ✦ Profile &amp; preferences
          </div>
          <h1><span className="gold">Settings</span></h1>
        </div>
      </div>

      <div className="settings-section">
        <div className="head">
          <h4>Profile</h4>
          <p>This is the name printed on shipping documents and used for sizing recommendations.</p>
        </div>
        <div>
          <div className="field-row">
            <div className="field">
              <label>First name</label>
              <input type="text" defaultValue="Wo" />
            </div>
            <div className="field">
              <label>Last name</label>
              <input type="text" defaultValue="Müller" />
            </div>
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" defaultValue="wo@obsidian.com" />
          </div>
          <div className="field">
            <label>Phone</label>
            <input type="tel" defaultValue="+49 30 1234 5678" />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="head">
          <h4>Sizing</h4>
          <p>We'll recommend the closest fit for every piece based on these.</p>
        </div>
        <div>
          <div className="field-row">
            <div className="field">
              <label>Top size</label>
              <select defaultValue="M"><option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option></select>
            </div>
            <div className="field">
              <label>Bottom size</label>
              <select defaultValue="32"><option>28</option><option>30</option><option>32</option><option>34</option><option>36</option></select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Shoe size (EU)</label>
              <input type="text" defaultValue="43" />
            </div>
            <div className="field">
              <label>Height</label>
              <input type="text" defaultValue="184 cm" />
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="head">
          <h4>Notifications</h4>
          <p>How and when we reach you. Inner Circle members get a private SMS before public drops.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            ["Drop notifications", "SMS · Email", true],
            ["Order updates", "Email · WhatsApp", true],
            ["Back-in-stock alerts", "Email", true],
            ["Newsletter ✦ Lookbook", "Email", false],
            ["Birthday gift reminder", "Email", true],
          ].map(([n, ch, on]) => (
            <div key={n} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 0", borderBottom: "1px solid var(--line)"
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{n}</div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: "var(--fg-dim)", marginTop: 2
                }}>{ch}</div>
              </div>
              <div style={{
                width: 40, height: 22, borderRadius: 999,
                background: on ? "var(--gold)" : "var(--line-2)",
                position: "relative", cursor: "pointer", transition: "background 0.2s var(--ease)"
              }}>
                <div style={{
                  position: "absolute", top: 2, left: on ? 20 : 2,
                  width: 18, height: 18, borderRadius: "50%",
                  background: on ? "#0a0a0a" : "var(--fg-dim)",
                  transition: "left 0.2s var(--ease)"
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <button className="btn btn-primary">Save changes</button>
        <button className="btn" style={{ color: "var(--accent-warn)", borderColor: "rgba(217,100,70,0.3)" }}>
          Delete account
        </button>
      </div>
    </>
  );
}

function Rewards() {
  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span style={{ width: 6, height: 6, background: "var(--gold)", borderRadius: "50%" }}></span>
            ✦ Members only · Gold tier
          </div>
          <h1>Inner <span className="gold">Circle</span></h1>
        </div>
      </div>

      <div className="tier-banner">
        <div className="info">
          <span className="tag">
            <span style={{ width: 6, height: 6, background: "var(--gold)", borderRadius: "50%", boxShadow: "0 0 8px var(--gold)" }}></span>
            Current ✦ Gold
          </span>
          <h3>2,180 points · €48 credit available</h3>
          <p>Spend €4 to earn 1 point. Redeem 100 points = €2 off. Points never expire while your tier is active.</p>
        </div>
        <div className="progress">
          <div className="meta"><span className="gold">2,180</span> / 3,200 to Onyx</div>
          <div className="bar"><div></div></div>
          <button className="btn btn-primary" style={{ marginTop: 8 }}>Redeem points <Icon.arrow /></button>
        </div>
      </div>

      <div className="acc-section-head">
        <h3>Tier benefits</h3>
      </div>
      <div className="addr-grid">
        {[
          { tier: "Silver", spend: "€0 — €2,000", perks: ["Free shipping over €100", "30-day returns", "Newsletter access"], active: false },
          { tier: "Gold", spend: "€2,000 — €7,000", perks: ["12h early access to drops", "Free shipping always", "−15% birthday gift", "Priority support"], active: true },
          { tier: "Onyx", spend: "€7,000+", perks: ["24h early access", "Private SMS line", "FW archive jacket gift", "Personal stylist", "Limited to 200 members"], active: false, locked: true },
        ].map(t => (
          <div key={t.tier} className={`addr-card ${t.active ? "default" : ""}`} style={t.locked ? { opacity: 0.7 } : {}}>
            {t.active && <span className="badge">Current</span>}
            {t.locked && <span className="badge" style={{ background: "#0a0a0a", color: "var(--gold)", border: "1px solid var(--gold)" }}>Locked</span>}
            <h4>{t.tier}</h4>
            <div className="name">{t.spend}</div>
            <div className="lines" style={{ marginTop: 12 }}>
              {t.perks.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <span style={{ color: t.active ? "var(--gold)" : "var(--fg-mute)" }}>✦</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Account({ setView, onSignOut, wishlist, setWishlist, onAddToCart, initialSection = "overview" }) {
  const [section, setSection] = useAccState(initialSection);
  React.useEffect(() => { setSection(initialSection); }, [initialSection]);

  return (
    <main className="fade-in account">
      <AccountSidebar section={section} setSection={setSection} wishlistCount={wishlist.length} onSignOut={onSignOut} />
      <div className="account-main">
        {section === "overview" && <Overview setSection={setSection} setView={setView} wishlist={wishlist} />}
        {section === "orders" && <Orders />}
        {section === "wishlist" && <Wishlist wishlist={wishlist} setWishlist={setWishlist} setView={setView} onAddToCart={onAddToCart} />}
        {section === "addresses" && <Addresses />}
        {section === "settings" && <Settings />}
        {section === "rewards" && <Rewards />}
      </div>
    </main>
  );
}

Object.assign(window, { Account });
