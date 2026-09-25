import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { OrderReturn } from "../components/account/OrderReturn";
import { ProfilePhoto } from "../components/account/ProfilePhoto";
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
import i18n, { currentLocale } from "../i18n";
import { mediaUrl, type AddressPayload, type ApiAddressDTO, type ApiOrderDTO } from "../lib/api";
import type { Product } from "../types";
import { formatPrice } from "../utils/format";

type Order = ApiOrderDTO;
type ProductMap = Map<string, Product>;

type Section = "overview" | "orders" | "wishlist" | "addresses" | "settings" | "rewards";
const SECTIONS: Section[] = ["overview", "orders", "wishlist", "addresses", "settings", "rewards"];

function euroFromCents(cents: number): number {
  return Math.round(cents / 100);
}

// These helpers live outside components, so they use i18n.t() directly
// instead of the useTranslation() hook.
const ORDER_STATUSES = ["pending", "paid", "preparing", "shipped", "delivered", "returned", "cancelled"];

function statusLabel(status: string): string {
  return ORDER_STATUSES.includes(status) ? i18n.t(`status.${status}`, { ns: "account" }) : status;
}

function formatDate(value: string | null): string {
  if (!value) return i18n.t("dates.pending", { ns: "account" });
  return new Intl.DateTimeFormat(currentLocale(), { month: "short", day: "2-digit", year: "numeric" }).format(new Date(value));
}

function formatLastLogin(value: string | null | undefined): string {
  if (!value) return i18n.t("dates.pendingSync", { ns: "account" });

  const date = new Date(value);
  const now = new Date();
  const timeZone = "Europe/Madrid";
  const dayFormatter = new Intl.DateTimeFormat(currentLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone,
  });
  const isToday = dayFormatter.format(date) === dayFormatter.format(now);
  const time = new Intl.DateTimeFormat(currentLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);

  if (isToday) return i18n.t("dates.today", { ns: "account", time });

  const day = new Intl.DateTimeFormat(currentLocale(), {
    month: "short",
    day: "2-digit",
    timeZone,
  }).format(date);

  return i18n.t("dates.day", { ns: "account", day, time });
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

function emptyAddress(userName: string, isDefault: boolean, label: string): AddressPayload {
  return {
    label,
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
  const { t } = useTranslation("account");
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
          {t("orderRow.order")} <span className="num">#{order.number}</span>
        </div>
        <div className="name">
          {t("orderRow.pieces", { count: order.items.length })} · {formatDate(order.created_at)}
        </div>
        <div className="info">{order.status === "shipped" ? t("orderRow.shipping") : formatDate(order.paid_at)}</div>
      </div>
      <div className={`status-pill ${order.status}`}>
        <span className="dot" />
        {statusLabel(order.status)}
      </div>
      <div className="total">{formatPrice(euroFromCents(order.total_cents))}</div>
      <button type="button" className="arrow-btn" aria-label={t("orderRow.view", { number: order.number })}>
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
  const { t } = useTranslation("account");
  const { ids: wishlist } = useWishlist();
  const lifetimeSpend = euroFromCents(stats.lifetime_spend_cents);
  const nextTierSpend = Math.max(0, 7000 - lifetimeSpend);
  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            {t("overview.memberSince", { tier: stats.tier })}
          </div>
          <h1>
            <span>{t("overview.welcome")}</span>
            <span className="gold">{userName.split(" ")[0] || t("overview.member")}</span>
            <span>.</span>
          </h1>
        </div>
        <div className="ts">
          {t("overview.lastLogin")}
          <br />
          {formatLastLogin(lastLoginAt)}
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="lbl">{t("overview.stats.totalOrders")}</span>
          <span className="val">{stats.orders_count}</span>
          <span className="delta">{t("overview.stats.synced")}</span>
        </div>
        <div className="stat-card gold">
          <span className="lbl">{t("overview.stats.lifetimeSpend")}</span>
          <span className="val">{formatPrice(lifetimeSpend)}</span>
          <span className="delta">{t("overview.stats.tierUnlocked", { tier: stats.tier })}</span>
        </div>
        <div className="stat-card">
          <span className="lbl">{t("overview.stats.rewardPoints")}</span>
          <span className="val">{stats.reward_points}</span>
          <span className="delta">{t("overview.stats.credit")}</span>
        </div>
        <div className="stat-card">
          <span className="lbl">{t("overview.stats.wishlist")}</span>
          <span className="val">{wishlist.length}</span>
          <span className="delta">{t("overview.stats.backInStock")}</span>
        </div>
      </div>

      <div className="tier-banner">
        <div className="info">
          <span className="tag">
            <span className="dot" />
            {t("overview.tier.tag")}
          </span>
          <h3>{t("overview.tier.title", { amount: formatPrice(nextTierSpend) })}</h3>
          <p>{t("overview.tier.text")}</p>
        </div>
        <div className="progress">
          <div className="meta">
            <span className="gold">{formatPrice(lifetimeSpend)}</span> / {formatPrice(7000)}
          </div>
          <div className="bar">
            <div />
          </div>
          <div className="meta">
            {t("overview.tier.progress", { percent: Math.min(100, Math.round((lifetimeSpend / 7000) * 100)) })}
          </div>
        </div>
      </div>

      <div className="acc-section-head">
        <h3>
          {t("overview.recent")}
          <span className="ct">{t("overview.recentRange")}</span>
        </h3>
        <button type="button" className="section-link" onClick={() => goTo("orders")}>
          {t("overview.viewAll")} <Icon.Arrow />
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
  const { t } = useTranslation("account");
  const { data: orders = [], isPending, isError } = useOrders();
  const [filter, setFilter] = useState<"all" | "shipped" | "delivered" | "cancelled">("all");
  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const transitCount = orders.filter((o) => o.status === "shipped").length;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;
  const total = euroFromCents(orders.reduce((sum, order) => sum + order.total_cents, 0));

  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            {t("orders.summary", { count: orders.length, total: formatPrice(total) })}
          </div>
          <h1>
            {t("orders.title1")}
            <span className="gold">{t("orders.title2")}</span>
          </h1>
        </div>
      </div>

      <div className="plp-toolbar" style={{ borderTop: "none", paddingTop: 0 }}>
        <div className="left">
          {(
            [
              ["all", t("orders.filters.all", { n: orders.length })],
              ["shipped", t("orders.filters.shipped", { n: transitCount })],
              ["delivered", t("orders.filters.delivered", { n: deliveredCount })],
              ["cancelled", t("orders.filters.cancelled", { n: cancelledCount })],
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
        {isPending && <div className="data-error">{t("orders.loading")}</div>}
        {isError && <div className="data-error">{t("orders.error")}</div>}
        {!isPending &&
          !isError &&
          filtered.map((o) => (
            <div key={o.id} className="order-block">
              <OrderRow order={o} productMap={productMap} />
              <OrderReturn order={o} />
            </div>
          ))}
      </div>
    </>
  );
}

function WishlistView({ productMap }: { productMap: ProductMap }) {
  const { t } = useTranslation("account");
  const navigate = useNavigate();
  const { ids, remove } = useWishlist();
  const { add } = useCart();

  if (ids.length === 0) {
    return (
      <>
        <div className="account-hello">
          <div>
            <div className="eyebrow">
              <span className="dot" />
              {t("wishlist.eyebrowEmpty")}
            </div>
            <h1>
              {t("wishlist.title1")}
            <span className="gold">{t("wishlist.title2")}</span>
            </h1>
          </div>
        </div>
        <div className="empty-state">
          <div className="icon">
            <Icon.Heart />
          </div>
          <h4>{t("wishlist.empty.title")}</h4>
          <p>{t("wishlist.empty.text")}</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/shop/new")}>
            {t("wishlist.empty.cta")} <Icon.Arrow />
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
            <span className="dot" />
            {t("wishlist.eyebrow", { n: ids.length })}
          </div>
          <h1>
            {t("wishlist.title1")}
            <span className="gold">{t("wishlist.title2")}</span>
          </h1>
        </div>
        <button type="button" className="btn">
          {t("wishlist.share")}
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
                  title={t("wishlist.removeFromWishlist")}
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
                    {t("wishlist.addToBag", { price: formatPrice(product.price) })}
                  </button>
                  <button
                    type="button"
                    className="remove"
                    onClick={() => remove(product.id)}
                    title={t("wishlist.remove")}
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
  const { t } = useTranslation("account");
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
      values: emptyAddress(
        account?.user.name ?? t("addresses.defaultName"),
        accountAddresses.length === 0,
        t("addresses.form.labelPlaceholder"),
      ),
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
            <span className="dot" />
            {t("addresses.eyebrow")}
          </div>
          <h1>
            {t("addresses.title1")}
            <span className="gold">{t("addresses.title2")}</span>
          </h1>
        </div>
      </div>

      {editing && (
        <form className="address-form settings-section" onSubmit={saveEditing}>
          <div className="head">
            <h4>{editing.id === null ? t("addresses.form.new") : t("addresses.form.edit")}</h4>
            <p>{t("addresses.form.saved")}</p>
          </div>
          <div>
            <div className="field-row">
              <div className="field">
                <label>{t("addresses.form.label")}</label>
                <input
                  type="text"
                  value={editing.values.label ?? ""}
                  onChange={(e) => patchEditing({ label: e.target.value })}
                  placeholder={t("addresses.form.labelPlaceholder")}
                />
              </div>
              <div className="field">
                <label>{t("addresses.form.fullName")}</label>
                <input
                  type="text"
                  value={editing.values.full_name}
                  onChange={(e) => patchEditing({ full_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>{t("addresses.form.line1")}</label>
              <input
                type="text"
                value={editing.values.line1}
                onChange={(e) => patchEditing({ line1: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>{t("addresses.form.line2")}</label>
              <input
                type="text"
                value={editing.values.line2 ?? ""}
                onChange={(e) => patchEditing({ line2: e.target.value || null })}
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label>{t("addresses.form.city")}</label>
                <input
                  type="text"
                  value={editing.values.city}
                  onChange={(e) => patchEditing({ city: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>{t("addresses.form.region")}</label>
                <input
                  type="text"
                  value={editing.values.region ?? ""}
                  onChange={(e) => patchEditing({ region: e.target.value || null })}
                />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>{t("addresses.form.postalCode")}</label>
                <input
                  type="text"
                  value={editing.values.postal_code}
                  onChange={(e) => patchEditing({ postal_code: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>{t("addresses.form.country")}</label>
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
              <label>{t("addresses.form.phone")}</label>
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
              <span>{t("addresses.form.default")}</span>
            </label>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? t("addresses.form.saving") : t("addresses.form.save")} <Icon.Arrow />
              </button>
              <button type="button" className="btn" onClick={() => setEditing(null)}>
                {t("addresses.form.cancel")}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="addr-grid">
        {isPending && <div className="data-error">{t("addresses.loading")}</div>}
        {isError && <div className="data-error">{t("addresses.error")}</div>}
        {accountAddresses.map((a) => (
          <div key={a.id} className={`addr-card ${a.is_default ? "default" : ""}`}>
            {a.is_default && <span className="badge">{t("addresses.badge")}</span>}
            <h4>{a.label ?? t("addresses.fallbackLabel")}</h4>
            <div className="name">{a.full_name}</div>
            <div className="lines">
              {addressLines(a).map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
            <div className="actions">
              <a onClick={() => startEdit(a)}>{t("addresses.edit")}</a>
              {!a.is_default && (
                <a onClick={() => updateAddress.mutate({ id: a.id, payload: { is_default: true } })}>
                  {t("addresses.setDefault")}
                </a>
              )}
              <a style={{ color: "var(--accent-warn)" }} onClick={() => deleteAddress.mutate(a.id)}>
                {t("addresses.remove")}
              </a>
            </div>
          </div>
        ))}
        <div className="addr-card add-new" onClick={startNew}>
          <span className="plus-big">+</span>
          <span>{t("addresses.addNew")}</span>
        </div>
      </div>
    </>
  );
}

function Settings() {
  const { t } = useTranslation("account");
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

  // The title of each one is in account.json, under "settings.notifications".
  const NOTIFICATIONS: { key: keyof typeof toggles; channels: string }[] = [
    { key: "drops", channels: "SMS · Email" },
    { key: "updates", channels: "Email · WhatsApp" },
    { key: "backInStock", channels: "Email" },
    { key: "newsletter", channels: "Email" },
    { key: "birthday", channels: "Email" },
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
    try {
      await updateUser.mutateAsync({ name: name.trim() || t("addresses.defaultName"), email });
      setProfileMessage(t("settings.profile.saved"));
    } catch {
      // The shared demo account can't change its name or email (API answers 403).
      setProfileMessage(user?.is_demo ? t("settings.profile.demoLocked") : t("settings.profile.saveFailed"));
    }
  };

  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            {t("settings.eyebrow")}
          </div>
          <h1>
            <span className="gold">{t("settings.title")}</span>
          </h1>
        </div>
      </div>

      <ProfilePhoto />

      <form className="settings-section" onSubmit={submitProfile}>
        <div className="head">
          <h4>{t("settings.profile.title")}</h4>
          <p>{t("settings.profile.text")}</p>
        </div>
        <div>
          <div className="field-row">
            <div className="field">
              <label>{t("settings.profile.firstName")}</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setName([e.target.value, lastName].filter(Boolean).join(" "))}
                required
              />
            </div>
            <div className="field">
              <label>{t("settings.profile.lastName")}</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setName([firstName, e.target.value].filter(Boolean).join(" "))}
              />
            </div>
          </div>
          <div className="field">
            <label>{t("settings.profile.email")}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>{t("settings.profile.phone")}</label>
            <input type="tel" placeholder="+34 612 345 678" disabled />
          </div>
          {profileMessage && <div className="auth-error" style={{ color: "var(--gold)" }}>{profileMessage}</div>}
          {updateUser.isError && <div className="auth-error">{t("settings.profile.error")}</div>}
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" disabled={updateUser.isPending}>
              {updateUser.isPending ? t("settings.profile.saving") : t("settings.profile.save")} <Icon.Arrow />
            </button>
          </div>
        </div>
      </form>

      <div className="settings-section">
        <div className="head">
          <h4>{t("settings.notifications.title")}</h4>
          <p>{t("settings.notifications.text")}</p>
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
                <div style={{ fontSize: 14, fontWeight: 500 }}>{t(`settings.notifications.${n.key}`)}</div>
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
                onClick={() => setToggles((current) => ({ ...current, [n.key]: !current[n.key] }))}
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
          {t("settings.deleteAccount")}
        </button>
      </div>
    </>
  );
}

function Rewards() {
  const { t } = useTranslation("account");
  const tiers = [
    {
      tier: "Silver",
      spend: `${formatPrice(0)} — ${formatPrice(2000)}`,
      perks: [
        t("rewards.tiers.silver.perk1"),
        t("rewards.tiers.silver.perk2"),
        t("rewards.tiers.silver.perk3"),
      ],
      active: false,
      locked: false,
    },
    {
      tier: "Gold",
      spend: `${formatPrice(2000)} — ${formatPrice(7000)}`,
      perks: [
        t("rewards.tiers.gold.perk1"),
        t("rewards.tiers.gold.perk2"),
        t("rewards.tiers.gold.perk3"),
        t("rewards.tiers.gold.perk4"),
      ],
      active: true,
      locked: false,
    },
    {
      tier: "Onyx",
      spend: `${formatPrice(7000)}+`,
      perks: [
        t("rewards.tiers.onyx.perk1"),
        t("rewards.tiers.onyx.perk2"),
        t("rewards.tiers.onyx.perk3"),
        t("rewards.tiers.onyx.perk4"),
        t("rewards.tiers.onyx.perk5"),
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
            <span className="dot" />
            {t("rewards.eyebrow")}
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
            {t("rewards.current")}
          </span>
          <h3>{t("rewards.points")}</h3>
          <p>{t("rewards.text")}</p>
        </div>
        <div className="progress">
          <div className="meta">
            <span className="gold">{(2180).toLocaleString(currentLocale())}</span>
            {t("rewards.progress")}
          </div>
          <div className="bar">
            <div />
          </div>
          <button type="button" className="btn btn-primary" style={{ marginTop: 8 }}>
            {t("rewards.redeem")} <Icon.Arrow />
          </button>
        </div>
      </div>

      <div className="acc-section-head">
        <h3>{t("rewards.benefits")}</h3>
      </div>
      <div className="addr-grid">
        {tiers.map((tier) => (
          <div
            key={tier.tier}
            className={`addr-card ${tier.active ? "default" : ""}`}
            style={tier.locked ? { opacity: 0.7 } : {}}
          >
            {tier.active && <span className="badge">{t("rewards.badgeCurrent")}</span>}
            {tier.locked && (
              <span
                className="badge"
                style={{
                  background: "#0a0a0a",
                  color: "var(--gold)",
                  border: "1px solid var(--gold)",
                }}
              >
                {t("rewards.badgeLocked")}
              </span>
            )}
            <h4>{tier.tier}</h4>
            <div className="name">{tier.spend}</div>
            <div className="lines" style={{ marginTop: 12 }}>
              {tier.perks.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <span style={{ color: tier.active ? "var(--gold)" : "var(--fg-mute)" }}>✦</span>
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
  const { t } = useTranslation("account");
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
    { id: "overview", label: t("nav.overview") },
    { id: "orders", label: t("nav.orders"), ct: orders.length },
    { id: "wishlist", label: t("nav.wishlist"), ct: wishlist.length },
    { id: "addresses", label: t("nav.addresses"), ct: addressCount },
    { id: "settings", label: t("nav.settings") },
    { id: "rewards", label: t("nav.rewards"), ct: "✦" },
  ];

  return (
    <main className="fade-in account">
      <aside className="account-side">
        <div className="user">
          <div className="avatar">
            {user.avatar_url ? <img src={mediaUrl(user.avatar_url)} alt="" referrerPolicy="no-referrer" /> : initials}
          </div>
          <div>
            <div className="name">{displayName}</div>
            <div className="tier">
              <span className="dot" />
              {t("nav.tier")}
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
              {logoutMutation.isPending ? t("nav.signingOut") : t("nav.signOut")}
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
