import { useTranslation } from "react-i18next";
import { Icon } from "../../components/ui/Icon";
import { currentLocale } from "../../i18n";
import type { ApiAccountStatsDTO } from "../../lib/api";
import { formatPrice } from "../../utils/format";
import { creditFromPoints, euroFromCents, progressTo, tierInfo, TIERS } from "./helpers";

/** The member's points and the three tiers with their benefits. */

export function Rewards({ stats }: { stats: ApiAccountStatsDTO }) {
  const { t } = useTranslation("account");
  const current = tierInfo(stats.tier);
  const currentIndex = TIERS.findIndex((tier) => tier.key === current.key);
  const lifetimeSpend = euroFromCents(stats.lifetime_spend_cents);
  const tiers = [
    {
      key: "silver",
      spend: `${formatPrice(0)} — ${formatPrice(2000)}`,
      perks: [
        t("rewards.tiers.silver.perk1"),
        t("rewards.tiers.silver.perk2"),
        t("rewards.tiers.silver.perk3"),
      ],
    },
    {
      key: "gold",
      spend: `${formatPrice(2000)} — ${formatPrice(7000)}`,
      perks: [
        t("rewards.tiers.gold.perk1"),
        t("rewards.tiers.gold.perk2"),
        t("rewards.tiers.gold.perk3"),
        t("rewards.tiers.gold.perk4"),
      ],
    },
    {
      key: "onyx",
      spend: `${formatPrice(7000)}+`,
      perks: [
        t("rewards.tiers.onyx.perk1"),
        t("rewards.tiers.onyx.perk2"),
        t("rewards.tiers.onyx.perk3"),
        t("rewards.tiers.onyx.perk4"),
        t("rewards.tiers.onyx.perk5"),
      ],
    },
  ].map((tier, index) => ({
    ...tier,
    // The member's tier is highlighted; the ones above it are still locked.
    active: index === currentIndex,
    locked: index > currentIndex,
  }));

  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            {t("rewards.eyebrow", { tier: t(`tiers.${current.key}`) })}
          </div>
          <h1>
            {t("rewards.title1")} <span className="gold">{t("rewards.title2")}</span>
          </h1>
        </div>
      </div>

      <div className="tier-banner">
        <div className="info">
          <span className="tag">
            <span className="dot" />
            {t("rewards.current", { tier: t(`tiers.${current.key}`) })}
          </span>
          <h3>
            {t("rewards.points", {
              points: stats.reward_points.toLocaleString(currentLocale()),
              credit: formatPrice(creditFromPoints(stats.reward_points)),
            })}
          </h3>
          <p>{t("rewards.text")}</p>
        </div>
        <div className="progress">
          {current.next && (
            <div className="meta">
              <span className="gold">{formatPrice(lifetimeSpend)}</span> / {formatPrice(current.next.from)}
              {t("rewards.progress", { tier: t(`tiers.${current.next.key}`) })}
            </div>
          )}
          <div className="bar">
            <div style={{ width: `${progressTo(current.next, lifetimeSpend)}%` }} />
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
            key={tier.key}
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
            <h4>{t(`tiers.${tier.key}`)}</h4>
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
