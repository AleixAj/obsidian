import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../components/ui/Icon";
import { Placeholder } from "../components/ui/Placeholder";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useLogout, useProducts, useUser } from "../hooks/queries";
import type { Product } from "../types";
import { formatPrice } from "../utils/format";

/* ===========================================
   Mock data — kept inline to keep the account
   page self-contained. Easy to replace with
   real API calls when auth is wired up.
   =========================================== */
/**
 * Mock order data. `products` holds product slugs (`p1`, `p7`, …) so
 * the rows can survive the move from the static catalogue to the live
 * backend without depending on array positions. The slug is the same
 * id the PDP route uses, so click-through stays consistent.
 */
const MOCK_ORDERS = [
  {
    id: "OBS-2641-OBS",
    date: "Nov 18, 2026",
    status: "transit",
    statusLabel: "In transit",
    total: 820,
    items: 2,
    products: ["p1", "p2"],
    eta: "2 days · DHL Express",
  },
  {
    id: "OBS-2588-AUR",
    date: "Nov 02, 2026",
    status: "delivered",
    statusLabel: "Delivered",
    total: 420,
    items: 1,
    products: ["p7"],
    eta: "Delivered Nov 04",
  },
  {
    id: "OBS-2511-CRE",
    date: "Oct 14, 2026",
    status: "delivered",
    statusLabel: "Delivered",
    total: 605,
    items: 2,
    products: ["p6", "p11"],
    eta: "Delivered Oct 17",
  },
  {
    id: "OBS-2402-VES",
    date: "Sep 28, 2026",
    status: "delivered",
    statusLabel: "Delivered",
    total: 890,
    items: 1,
    products: ["p4"],
    eta: "Delivered Oct 01",
  },
  {
    id: "OBS-2380-HAL",
    date: "Sep 12, 2026",
    status: "cancelled",
    statusLabel: "Refunded",
    total: 285,
    items: 1,
    products: ["p6"],
    eta: "Refunded Sep 15",
  },
] as const;

type Order = (typeof MOCK_ORDERS)[number];
type ProductMap = Map<string, Product>;

const MOCK_ADDRESSES = [
  {
    id: 1,
    label: "Home",
    name: "Aleix Auqué",
    lines: ["Carrer d'Aragó 234, 4º 2ª", "08007 Barcelona", "Spain", "+34 612 345 678"],
    default: true,
  },
  {
    id: 2,
    label: "Studio",
    name: "Aleix Auqué",
    lines: ["1245 Sunset Blvd", "Los Angeles, CA 90026", "United States", "+1 (323) 555-0147"],
    default: false,
  },
];

type Section = "overview" | "orders" | "wishlist" | "addresses" | "settings" | "rewards";
const SECTIONS: Section[] = ["overview", "orders", "wishlist", "addresses", "settings", "rewards"];

/* ===========================================
   Section components
   =========================================== */

function OrderRow({ order, productMap }: { order: Order; productMap: ProductMap }) {
  return (
    <div className="order-card">
      <div className="stack">
        {order.products.slice(0, 3).map((slug, i) => {
          const p = productMap.get(slug);
          return p ? (
            <div key={i} className="thumb">
              <Placeholder palette={p.palette} corner={false} img={p.img} />
            </div>
          ) : (
            <div key={i} className="thumb">
              <Placeholder palette="warm" corner={false} />
            </div>
          );
        })}
      </div>
      <div>
        <div className="id">
          Order <span className="num">#{order.id}</span>
        </div>
        <div className="name">
          {order.items} {order.items > 1 ? "pieces" : "piece"} · {order.date}
        </div>
        <div className="info">{order.eta}</div>
      </div>
      <div className={`status-pill ${order.status}`}>
        <span className="dot" />
        {order.statusLabel}
      </div>
      <div className="total">{formatPrice(order.total)}</div>
      <button type="button" className="arrow-btn" aria-label={`View order ${order.id}`}>
        <Icon.Arrow />
      </button>
    </div>
  );
}

function Overview({
  goTo,
  productMap,
  userName,
}: {
  goTo: (section: Section) => void;
  productMap: ProductMap;
  userName: string;
}) {
  const { ids: wishlist } = useWishlist();
  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            Member since 2024 ✦ Gold Tier
          </div>
          <h1>
            <span>Welcome back, </span>
            <span className="gold">{userName.split(" ")[0] || "Member"}</span>
            <span>.</span>
          </h1>
        </div>
        <div className="ts">
          ✦ Last login
          <br />
          Today · 22:14 Barcelona
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
            <span className="dot" />
            Inner Circle ✦ Gold
          </span>
          <h3>You're €580 from Onyx tier.</h3>
          <p>
            Onyx unlocks 24h early access to every drop, a personal stylist via WhatsApp, and the
            FW26 archive jacket as a welcome gift. Limited to 200 members worldwide.
          </p>
        </div>
        <div className="progress">
          <div className="meta">
            <span className="gold">€6,420</span> / €7,000
          </div>
          <div className="bar">
            <div />
          </div>
          <div className="meta">68% to Onyx</div>
        </div>
      </div>

      <div className="acc-section-head">
        <h3>
          Recent orders <span className="ct">— Last 30 days</span>
        </h3>
        <button type="button" className="section-link" onClick={() => goTo("orders")}>
          View all <Icon.Arrow />
        </button>
      </div>
      <div className="orders-list">
        {MOCK_ORDERS.slice(0, 3).map((o) => (
          <OrderRow key={o.id} order={o} productMap={productMap} />
        ))}
      </div>
    </>
  );
}

function Orders({ productMap }: { productMap: ProductMap }) {
  const [filter, setFilter] = useState<"all" | "transit" | "delivered" | "cancelled">("all");
  const filtered =
    filter === "all" ? MOCK_ORDERS : MOCK_ORDERS.filter((o) => o.status === filter);
  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            ✦ {MOCK_ORDERS.length} orders · €3,020 total
          </div>
          <h1>
            Your <span className="gold">orders</span>
          </h1>
        </div>
      </div>

      <div className="plp-toolbar" style={{ borderTop: "none", paddingTop: 0 }}>
        <div className="left">
          {(
            [
              ["all", `All (${MOCK_ORDERS.length})`],
              ["transit", "In transit (1)"],
              ["delivered", "Delivered (3)"],
              ["cancelled", "Refunded (1)"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              style={{
                color: filter === k ? "var(--gold)" : "var(--fg-dim)",
                borderBottom: filter === k ? "1px solid var(--gold)" : "1px solid transparent",
                paddingBottom: 4,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="orders-list">
        {filtered.map((o) => (
          <OrderRow key={o.id} order={o} productMap={productMap} />
        ))}
      </div>
    </>
  );
}

function WishlistView({ productMap }: { productMap: ProductMap }) {
  const navigate = useNavigate();
  const { ids, remove } = useWishlist();
  const { add } = useCart();

  if (ids.length === 0) {
    return (
      <>
        <div className="account-hello">
          <div>
            <div className="eyebrow">
              <span className="dot" />✦ Saved pieces
            </div>
            <h1>
              Your <span className="gold">wishlist</span>
            </h1>
          </div>
        </div>
        <div className="empty-state">
          <div className="icon">
            <Icon.Heart />
          </div>
          <h4>Nothing saved yet</h4>
          <p>
            Tap the heart on any piece to save it here. We'll let you know when items go on sale
            or come back in stock.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/shop/new")}>
            Explore the drop <Icon.Arrow />
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
            <span className="dot" />✦ {ids.length} saved · 3 back in stock
          </div>
          <h1>
            Your <span className="gold">wishlist</span>
          </h1>
        </div>
        <button type="button" className="btn">
          Share wishlist ↗
        </button>
      </div>

      <div className="wishlist-grid">
        {ids.map((id) => {
          const product = productMap.get(id);
          if (!product) return null;
          return (
            <article key={product.id} className="wish-card">
              <div className="img" onClick={() => navigate(`/product/${product.id}`)}>
                <button
                  type="button"
                  className="heart-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(product.id);
                  }}
                  title="Remove from wishlist"
                >
                  <Icon.Heart />
                </button>
                <Placeholder
                  palette={product.palette}
                  corner
                  img={product.img}
                  label={product.id.toUpperCase()}
                />
              </div>
              <div className="info">
                <div
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="name">{product.name}</div>
                  <div className="cat">
                    {product.cat} · {formatPrice(product.price)}
                  </div>
                </div>
                <div className="actions">
                  <button type="button" className="btn-add" onClick={() => add(product)}>
                    Add to bag — {formatPrice(product.price)}
                  </button>
                  <button
                    type="button"
                    className="remove"
                    onClick={() => remove(product.id)}
                    title="Remove"
                  >
                    <Icon.Close />
                  </button>
                </div>
              </div>
            </article>
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
            <span className="dot" />✦ Shipping &amp; billing
          </div>
          <h1>
            Your <span className="gold">addresses</span>
          </h1>
        </div>
      </div>

      <div className="addr-grid">
        {MOCK_ADDRESSES.map((a) => (
          <div key={a.id} className={`addr-card ${a.default ? "default" : ""}`}>
            {a.default && <span className="badge">Default</span>}
            <h4>{a.label}</h4>
            <div className="name">{a.name}</div>
            <div className="lines">
              {a.lines.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
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
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    drops: true,
    updates: true,
    backInStock: true,
    newsletter: false,
    birthday: true,
  });

  const NOTIFICATIONS: { key: keyof typeof toggles; title: string; channels: string }[] = [
    { key: "drops", title: "Drop notifications", channels: "SMS · Email" },
    { key: "updates", title: "Order updates", channels: "Email · WhatsApp" },
    { key: "backInStock", title: "Back-in-stock alerts", channels: "Email" },
    { key: "newsletter", title: "Newsletter ✦ Lookbook", channels: "Email" },
    { key: "birthday", title: "Birthday gift reminder", channels: "Email" },
  ];

  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span className="dot" />✦ Profile &amp; preferences
          </div>
          <h1>
            <span className="gold">Settings</span>
          </h1>
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
              <input type="text" defaultValue="Aleix" />
            </div>
            <div className="field">
              <label>Last name</label>
              <input type="text" defaultValue="Auqué" />
            </div>
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" defaultValue="aleix@obsidian.com" />
          </div>
          <div className="field">
            <label>Phone</label>
            <input type="tel" defaultValue="+34 612 345 678" />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="head">
          <h4>Notifications</h4>
          <p>How and when we reach you. Inner Circle members get a private SMS before public drops.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {NOTIFICATIONS.map((n) => (
            <div
              key={n.key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{n.title}</div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--fg-dim)",
                    marginTop: 2,
                  }}
                >
                  {n.channels}
                </div>
              </div>
              <button
                type="button"
                className={`toggle ${toggles[n.key] ? "on" : ""}`}
                aria-pressed={toggles[n.key]}
                onClick={() => setToggles((t) => ({ ...t, [n.key]: !t[n.key] }))}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <button type="button" className="btn btn-primary">
          Save changes
        </button>
        <button
          type="button"
          className="btn"
          style={{ color: "var(--accent-warn)", borderColor: "rgba(217,100,70,0.3)" }}
        >
          Delete account
        </button>
      </div>
    </>
  );
}

function Rewards() {
  const tiers = [
    {
      tier: "Silver",
      spend: "€0 — €2,000",
      perks: ["Free shipping over €100", "30-day returns", "Newsletter access"],
      active: false,
      locked: false,
    },
    {
      tier: "Gold",
      spend: "€2,000 — €7,000",
      perks: [
        "12h early access to drops",
        "Free shipping always",
        "−15% birthday gift",
        "Priority support",
      ],
      active: true,
      locked: false,
    },
    {
      tier: "Onyx",
      spend: "€7,000+",
      perks: [
        "24h early access",
        "Private SMS line",
        "FW archive jacket gift",
        "Personal stylist",
        "Limited to 200 members",
      ],
      active: false,
      locked: true,
    },
  ];

  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span className="dot" />✦ Members only · Gold tier
          </div>
          <h1>
            Inner <span className="gold">Circle</span>
          </h1>
        </div>
      </div>

      <div className="tier-banner">
        <div className="info">
          <span className="tag">
            <span className="dot" />
            Current ✦ Gold
          </span>
          <h3>2,180 points · €48 credit available</h3>
          <p>
            Spend €4 to earn 1 point. Redeem 100 points = €2 off. Points never expire while your
            tier is active.
          </p>
        </div>
        <div className="progress">
          <div className="meta">
            <span className="gold">2,180</span> / 3,200 to Onyx
          </div>
          <div className="bar">
            <div />
          </div>
          <button type="button" className="btn btn-primary" style={{ marginTop: 8 }}>
            Redeem points <Icon.Arrow />
          </button>
        </div>
      </div>

      <div className="acc-section-head">
        <h3>Tier benefits</h3>
      </div>
      <div className="addr-grid">
        {tiers.map((t) => (
          <div
            key={t.tier}
            className={`addr-card ${t.active ? "default" : ""}`}
            style={t.locked ? { opacity: 0.7 } : {}}
          >
            {t.active && <span className="badge">Current</span>}
            {t.locked && (
              <span
                className="badge"
                style={{
                  background: "#0a0a0a",
                  color: "var(--gold)",
                  border: "1px solid var(--gold)",
                }}
              >
                Locked
              </span>
            )}
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

/**
 * Account dashboard.
 *
 * Composed of a sticky sidebar + a content area that swaps based on
 * the section param. Section state lives in the URL (`/account/orders`)
 * so the user can deep-link or refresh without losing context.
 */
export function Account() {
  const { section } = useParams<{ section?: Section }>();
  const navigate = useNavigate();
  const { data: user } = useUser();
  const logoutMutation = useLogout();

  const current: Section =
    section && SECTIONS.includes(section as Section) ? (section as Section) : "overview";

  const goTo = (s: Section) => navigate(s === "overview" ? "/account" : `/account/${s}`);

  // Make sure landing on /account scrolls to the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [current]);

  const { ids: wishlist } = useWishlist();

  // Order thumbnails and wishlist cards look products up by slug, so a
  // single `Map<slug, Product>` keeps every section's render loop O(1)
  // without forcing each one to call `useProducts` and re-derive it.
  const { data: products = [] } = useProducts();
  const productMap = useMemo<ProductMap>(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  const displayName = user?.name ?? "Aleix Auqué";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AA";

  const handleSignOut = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
  };

  const items: { id: Section; label: string; ct?: number | string }[] = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Orders", ct: MOCK_ORDERS.length },
    { id: "wishlist", label: "Wishlist", ct: wishlist.length },
    { id: "addresses", label: "Addresses", ct: MOCK_ADDRESSES.length },
    { id: "settings", label: "Settings" },
    { id: "rewards", label: "Inner Circle", ct: "✦" },
  ];

  return (
    <main className="fade-in account">
      <aside className="account-side">
        <div className="user">
          <div className="avatar">{initials}</div>
          <div>
            <div className="name">{displayName}</div>
            <div className="tier">
              <span className="dot" />
              Inner Circle · Gold
            </div>
          </div>
        </div>
        <ul className="account-nav">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={current === item.id ? "active" : ""}
                onClick={() => goTo(item.id)}
              >
                <span>{item.label}</span>
                {item.ct != null && <span className="ct">{item.ct}</span>}
              </button>
            </li>
          ))}
          <li className="signout">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={logoutMutation.isPending}
              style={{ color: "var(--fg-mute)" }}
            >
              {logoutMutation.isPending ? "Signing out..." : "Sign out"}
            </button>
          </li>
        </ul>
      </aside>
      <div className="account-main">
        {current === "overview" && <Overview goTo={goTo} productMap={productMap} userName={displayName} />}
        {current === "orders" && <Orders productMap={productMap} />}
        {current === "wishlist" && <WishlistView productMap={productMap} />}
        {current === "addresses" && <Addresses />}
        {current === "settings" && <Settings />}
        {current === "rewards" && <Rewards />}
      </div>
    </main>
  );
}
