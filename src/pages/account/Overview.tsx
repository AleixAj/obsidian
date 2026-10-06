import { useTranslation } from "react-i18next";
import { Icon } from "../../components/ui/Icon";
import { useWishlist } from "../../context/WishlistContext";
import type { ApiAccountStatsDTO, ApiOrderDTO } from "../../lib/api";
import { formatPrice } from "../../utils/format";
import {
  creditFromPoints,
  euroFromCents,
  formatLastLogin,
  progressTo,
  tierInfo,
  type ProductMap,
  type Section,
} from "./helpers";
import { OrderRow } from "./OrderRow";

/** First section: welcome, numbers, the member tier and the latest orders. */

export function Overview({
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
  orders: ApiOrderDTO[];
  stats: ApiAccountStatsDTO;
}) {
  const { t } = useTranslation("account");
  const { ids: wishlist } = useWishlist();
  const lifetimeSpend = euroFromCents(stats.lifetime_spend_cents);
  const tier = tierInfo(stats.tier);
  const tierName = t(`tiers.${tier.key}`);
  const nextName = tier.next ? t(`tiers.${tier.next.key}`) : "";
  const percent = progressTo(tier.next, lifetimeSpend);
  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            {t("overview.memberSince", { tier: tierName })}
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
          <span className="delta">{t("overview.stats.tierUnlocked", { tier: tierName })}</span>
        </div>
        <div className="stat-card">
          <span className="lbl">{t("overview.stats.rewardPoints")}</span>
          <span className="val">{stats.reward_points}</span>
          <span className="delta">{t("overview.stats.credit", { amount: formatPrice(creditFromPoints(stats.reward_points)) })}</span>
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
            {t("overview.tier.tag", { tier: tierName })}
          </span>
          {tier.next ? (
            <>
              <h3>
                {t("overview.tier.title", {
                  amount: formatPrice(Math.max(0, tier.next.from - lifetimeSpend)),
                  tier: nextName,
                })}
              </h3>
              <p>{t(tier.next.key === "gold" ? "overview.tier.textGold" : "overview.tier.textOnyx")}</p>
            </>
          ) : (
            <>
              <h3>{t("overview.tier.topTitle")}</h3>
              <p>{t("overview.tier.topText")}</p>
            </>
          )}
        </div>
        {tier.next && (
          <div className="progress">
            <div className="meta">
              <span className="gold">{formatPrice(lifetimeSpend)}</span> / {formatPrice(tier.next.from)}
            </div>
            <div className="bar">
              <div style={{ width: `${percent}%` }} />
            </div>
            <div className="meta">
              {t("overview.tier.progress", { percent, tier: nextName })}
            </div>
          </div>
        )}
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
          <OrderRow key={o.id} order={o} productMap={productMap} onOpen={() => goTo("orders")} />
        ))}
      </div>
    </>
  );
}
