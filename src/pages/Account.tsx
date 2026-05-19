import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../components/ui/Icon";
import { Placeholder } from "../components/ui/Placeholder";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import {
  useAccount,
  useCreateAddress,
  useDeleteAddress,
  useLogout,
  useOrders,
  useProducts,
  useUpdateUser,
  useUpdateAddress,
  useUser,
} from "../hooks/queries";
import type { AddressPayload, ApiAddressDTO, ApiOrderDTO } from "../lib/api";
import type { Product } from "../types";
import { formatPrice } from "../utils/format";

type Order = ApiOrderDTO;
type ProductMap = Map<string, Product>;

type Section = "overview" | "orders" | "wishlist" | "addresses" | "settings" | "rewards";
const SECTIONS: Section[] = ["overview", "orders", "wishlist", "addresses", "settings", "rewards"];

function euroFromCents(cents: number): number {
  return Math.round(cents / 100);
}

function statusLabel(status: string): string {
  return (
    {
      pending: "Pending",
      transit: "In transit",
      delivered: "Delivered",
      cancelled: "Refunded",
    }[status] ?? status
  );
}

function formatDate(value: string | null): string {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(value));
}

function formatLastLogin(value: string | null | undefined): string {
  if (!value) return "Pending sync";

  const date = new Date(value);
  const now = new Date();
  const timeZone = "Europe/Madrid";
  const dayFormatter = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone,
  });
  const isToday = dayFormatter.format(date) === dayFormatter.format(now);
  const time = new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);

  if (isToday) return `Today · ${time} Barcelona`;

  const day = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    timeZone,
  }).format(date);

  return `${day} · ${time} Barcelona`;
}

function addressLines(address: ApiAddressDTO): string[] {
  return [
    address.line1,
    address.line2,
    `${address.postal_code} ${address.city}${address.region ? `, ${address.region}` : ""}`,
    address.country,
    address.phone,
  ].filter(Boolean) as string[];
}

function emptyAddress(userName: string, isDefault: boolean): AddressPayload {
  return {
    label: "Home",
    full_name: userName,
    line1: "",
    line2: null,
    city: "",
    region: null,
    postal_code: "",
    country: "ES",
    phone: null,
    is_default: isDefault,
  };
}

function toAddressPayload(address: ApiAddressDTO): AddressPayload {
  return {
    label: address.label,
    full_name: address.full_name,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    region: address.region,
    postal_code: address.postal_code,
    country: address.country,
    phone: address.phone,
    is_default: address.is_default,
  };
}

/* ===========================================
   Section components
   =========================================== */

function OrderRow({ order, productMap }: { order: Order; productMap: ProductMap }) {
  return (
    <div className="order-card">
      <div className="stack">
        {order.items.slice(0, 3).map((item, i) => {
          const p = productMap.get(item.product_slug);
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
          Order <span className="num">#{order.number}</span>
        </div>
        <div className="name">
          {order.items.length} {order.items.length > 1 ? "pieces" : "piece"} · {formatDate(order.created_at)}
        </div>
        <div className="info">{order.status === "transit" ? "2 days · DHL Express" : formatDate(order.paid_at)}</div>
      </div>
      <div className={`status-pill ${order.status}`}>
        <span className="dot" />
        {statusLabel(order.status)}
      </div>
      <div className="total">{formatPrice(euroFromCents(order.total_cents))}</div>
      <button type="button" className="arrow-btn" aria-label={`View order ${order.number}`}>
        <Icon.Arrow />
      </button>
    </div>
  );
}

function Overview({
  goTo,
  productMap,
  userName,
  lastLoginAt,
  orders,
  stats,
}: {
  goTo: (section: Section) => void;
  productMap: ProductMap;
  userName: string;
  lastLoginAt: string | null | undefined;
  orders: Order[];
  stats: { orders_count: number; lifetime_spend_cents: number; reward_points: number; tier: string };
}) {
  const { ids: wishlist } = useWishlist();
  const lifetimeSpend = euroFromCents(stats.lifetime_spend_cents);
  const nextTierSpend = Math.max(0, 7000 - lifetimeSpend);
  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            Member since 2024 ✦ {stats.tier} Tier
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
          {formatLastLogin(lastLoginAt)}
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="lbl">Total orders</span>
          <span className="val">{stats.orders_count}</span>
          <span className="delta">Synced from backend</span>
        </div>
        <div className="stat-card gold">
          <span className="lbl">Lifetime spend</span>
          <span className="val">{formatPrice(lifetimeSpend)}</span>
          <span className="delta">{stats.tier} tier unlocked</span>
        </div>
        <div className="stat-card">
          <span className="lbl">Reward points</span>
          <span className="val">{stats.reward_points}</span>
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
          <h3>You're {formatPrice(nextTierSpend)} from Onyx tier.</h3>
          <p>
            Onyx unlocks 24h early access to every drop, a personal stylist via WhatsApp, and the
            FW26 archive jacket as a welcome gift. Limited to 200 members worldwide.
          </p>
        </div>
        <div className="progress">
          <div className="meta">
            <span className="gold">{formatPrice(lifetimeSpend)}</span> / €7,000
          </div>
          <div className="bar">
            <div />
          </div>
          <div className="meta">{Math.min(100, Math.round((lifetimeSpend / 7000) * 100))}% to Onyx</div>
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
        {orders.slice(0, 3).map((o) => (
          <OrderRow key={o.id} order={o} productMap={productMap} />
        ))}
      </div>
    </>
  );
}

function Orders({ productMap }: { productMap: ProductMap }) {
  const { data: orders = [], isPending, isError } = useOrders();
  const [filter, setFilter] = useState<"all" | "transit" | "delivered" | "cancelled">("all");
  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const transitCount = orders.filter((o) => o.status === "transit").length;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;
  const total = euroFromCents(orders.reduce((sum, order) => sum + order.total_cents, 0));

  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            ✦ {orders.length} orders · {formatPrice(total)} total
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
              ["all", `All (${orders.length})`],
              ["transit", `In transit (${transitCount})`],
              ["delivered", `Delivered (${deliveredCount})`],
              ["cancelled", `Refunded (${cancelledCount})`],
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
        {isPending && <div className="data-error">Loading your orders…</div>}
        {isError && <div className="data-error">Couldn't load your orders.</div>}
        {!isPending &&
          !isError &&
          filtered.map((o) => <OrderRow key={o.id} order={o} productMap={productMap} />)}
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
  const { data: account, isPending, isError } = useAccount();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const accountAddresses = account?.addresses ?? [];
  const [editing, setEditing] = useState<{ id: number | null; values: AddressPayload } | null>(null);

  const isSaving = createAddress.isPending || updateAddress.isPending;

  const startNew = () =>
    setEditing({
      id: null,
      values: emptyAddress(account?.user.name ?? "Obsidian Member", accountAddresses.length === 0),
    });

  const startEdit = (address: ApiAddressDTO) =>
    setEditing({
      id: address.id,
      values: toAddressPayload(address),
    });

  const patchEditing = (patch: Partial<AddressPayload>) => {
    setEditing((current) =>
      current ? { ...current, values: { ...current.values, ...patch } } : current,
    );
  };

  const saveEditing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    if (editing.id === null) {
      await createAddress.mutateAsync(editing.values);
    } else {
      await updateAddress.mutateAsync({ id: editing.id, payload: editing.values });
    }

    setEditing(null);
  };

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

      {editing && (
        <form className="address-form settings-section" onSubmit={saveEditing}>
          <div className="head">
            <h4>{editing.id === null ? "New address" : "Edit address"}</h4>
            <p>Saved to your authenticated Obsidian account.</p>
          </div>
          <div>
            <div className="field-row">
              <div className="field">
                <label>Label</label>
                <input
                  type="text"
                  value={editing.values.label ?? ""}
                  onChange={(e) => patchEditing({ label: e.target.value })}
                  placeholder="Home"
                />
              </div>
              <div className="field">
                <label>Full name</label>
                <input
                  type="text"
                  value={editing.values.full_name}
                  onChange={(e) => patchEditing({ full_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Address line 1</label>
              <input
                type="text"
                value={editing.values.line1}
                onChange={(e) => patchEditing({ line1: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Address line 2</label>
              <input
                type="text"
                value={editing.values.line2 ?? ""}
                onChange={(e) => patchEditing({ line2: e.target.value || null })}
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label>City</label>
                <input
                  type="text"
                  value={editing.values.city}
                  onChange={(e) => patchEditing({ city: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Region</label>
                <input
                  type="text"
                  value={editing.values.region ?? ""}
                  onChange={(e) => patchEditing({ region: e.target.value || null })}
                />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Postal code</label>
                <input
                  type="text"
                  value={editing.values.postal_code}
                  onChange={(e) => patchEditing({ postal_code: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Country code</label>
                <input
                  type="text"
                  value={editing.values.country}
                  onChange={(e) => patchEditing({ country: e.target.value.toUpperCase().slice(0, 2) })}
                  required
                  maxLength={2}
                />
              </div>
            </div>
            <div className="field">
              <label>Phone</label>
              <input
                type="tel"
                value={editing.values.phone ?? ""}
                onChange={(e) => patchEditing({ phone: e.target.value || null })}
              />
            </div>
            <label className={`checkbox-row ${editing.values.is_default ? "checked" : ""}`}>
              <span className="box">{editing.values.is_default && <span style={{ fontSize: 9 }}>✓</span>}</span>
              <input
                type="checkbox"
                checked={editing.values.is_default}
                onChange={(e) => patchEditing({ is_default: e.target.checked })}
                style={{ display: "none" }}
              />
              <span>Use as default shipping address.</span>
            </label>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save address"} <Icon.Arrow />
              </button>
              <button type="button" className="btn" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="addr-grid">
        {isPending && <div className="data-error">Loading your addresses…</div>}
        {isError && <div className="data-error">Couldn't load your addresses.</div>}
        {accountAddresses.map((a) => (
          <div key={a.id} className={`addr-card ${a.is_default ? "default" : ""}`}>
            {a.is_default && <span className="badge">Default</span>}
            <h4>{a.label ?? "Address"}</h4>
            <div className="name">{a.full_name}</div>
            <div className="lines">
              {addressLines(a).map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
            <div className="actions">
              <a onClick={() => startEdit(a)}>Edit</a>
              {!a.is_default && (
                <a onClick={() => updateAddress.mutate({ id: a.id, payload: { is_default: true } })}>
                  Set default
                </a>
              )}
              <a style={{ color: "var(--accent-warn)" }} onClick={() => deleteAddress.mutate(a.id)}>Remove</a>
            </div>
          </div>
        ))}
        <div className="addr-card add-new" onClick={startNew}>
          <span className="plus-big">+</span>
          <span>Add new address</span>
        </div>
      </div>
    </>
  );
}

function Settings() {
  const { data: user } = useUser();
  const updateUser = useUpdateUser();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
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

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const [firstName, ...lastNameParts] = name.split(" ");
  const lastName = lastNameParts.join(" ");

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    await updateUser.mutateAsync({ name: name.trim() || "Obsidian Member", email });
    setProfileMessage("Profile saved.");
  };

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

      <form className="settings-section" onSubmit={submitProfile}>
        <div className="head">
          <h4>Profile</h4>
          <p>This is the name printed on shipping documents and used for sizing recommendations.</p>
        </div>
        <div>
          <div className="field-row">
            <div className="field">
              <label>First name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setName([e.target.value, lastName].filter(Boolean).join(" "))}
                required
              />
            </div>
            <div className="field">
              <label>Last name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setName([firstName, e.target.value].filter(Boolean).join(" "))}
              />
            </div>
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Phone</label>
            <input type="tel" placeholder="+34 612 345 678" disabled />
          </div>
          {profileMessage && <div className="auth-error" style={{ color: "var(--gold)" }}>{profileMessage}</div>}
          {updateUser.isError && <div className="auth-error">Couldn't save profile. Email may already be in use.</div>}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" disabled={updateUser.isPending}>
              {updateUser.isPending ? "Saving..." : "Save profile"} <Icon.Arrow />
            </button>
          </div>
        </div>
      </form>

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
  const { data: account } = useAccount();
  const logoutMutation = useLogout();
  const { ids: wishlist } = useWishlist();
  const { data: products = [] } = useProducts();

  const current: Section =
    section && SECTIONS.includes(section as Section) ? (section as Section) : "overview";

  const goTo = (s: Section) => navigate(s === "overview" ? "/account" : `/account/${s}`);

  // Make sure landing on /account scrolls to the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [current]);

  // Order thumbnails and wishlist cards look products up by slug, so a
  // single `Map<slug, Product>` keeps every section's render loop O(1)
  // without forcing each one to call `useProducts` and re-derive it.
  const productMap = useMemo<ProductMap>(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  if (!user) {
    return null;
  }

  const displayName = user.name;
  const lastLoginAt = account?.user.last_login_at ?? user.last_login_at;
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

  const orders = account?.orders ?? [];
  const stats = account?.stats ?? {
    orders_count: 0,
    lifetime_spend_cents: 0,
    reward_points: 0,
    tier: "Silver",
  };
  const addressCount = account?.addresses.length ?? 0;

  const items: { id: Section; label: string; ct?: number | string }[] = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Orders", ct: orders.length },
    { id: "wishlist", label: "Wishlist", ct: wishlist.length },
    { id: "addresses", label: "Addresses", ct: addressCount },
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
        {current === "overview" && (
          <Overview
            goTo={goTo}
            productMap={productMap}
            userName={displayName}
            lastLoginAt={lastLoginAt}
            orders={orders}
            stats={stats}
          />
        )}
        {current === "orders" && <Orders productMap={productMap} />}
        {current === "wishlist" && <WishlistView productMap={productMap} />}
        {current === "addresses" && <Addresses />}
        {current === "settings" && <Settings />}
        {current === "rewards" && <Rewards />}
      </div>
    </main>
  );
}
