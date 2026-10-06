import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAccount, useLogout, useProducts, useUser } from "../hooks/queries";
import { mediaUrl } from "../lib/api";
import { Addresses } from "./account/Addresses";
import { SECTIONS, tierInfo, type ProductMap, type Section } from "./account/helpers";
import { Orders } from "./account/Orders";
import { Overview } from "./account/Overview";
import { Rewards } from "./account/Rewards";
import { Settings } from "./account/Settings";
import { WishlistView } from "./account/Wishlist";

/**
 * The "My account" page: a menu on the left and the chosen section.
 * The section is in the URL (/account/orders), so a reload or a link
 * opens the same one.
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

  // Changing section starts at the top of the page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [current]);

  // Orders and the wishlist only have product slugs. This map finds the
  // product (photo, price...) of a slug, and every section shares it.
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

  // Even if the request fails (e.g. the session already expired), the
  // local session is cleared (see useLogout), so we always go home.
  const handleSignOut = () => {
    logoutMutation.mutate(undefined, { onSettled: () => navigate("/") });
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
              {t("nav.tier", { tier: t(`tiers.${tierInfo(stats.tier).key}`) })}
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
        {/* key: a different user gets a fresh form. We don't copy the user
            into the form on every refresh, or it would wipe what is being typed. */}
        {current === "settings" && <Settings key={user.id} />}
        {current === "rewards" && <Rewards stats={stats} />}
      </div>
    </main>
  );
}
