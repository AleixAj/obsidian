import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useUser } from "../../hooks/queries";
import type { Range } from "../api";
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { SalesChart } from "../components/SalesChart";
import { StatusBadge } from "../components/StatusBadge";
import { count, money, moneyShort, shortDate } from "../format";
import { useDashboard } from "../hooks";

// Button texts and chart titles are in admin.json: "overview.ranges.7d", "overview.chartTitles.7d"...
const RANGES: Range[] = ["today", "7d", "30d"];

/** First page of the panel: KPIs, sales chart, best sellers and latest orders. */
export function Overview() {
  const { t } = useTranslation("admin");
  const [range, setRange] = useState<Range>("30d");
  const { data, isPending, isError } = useDashboard(range);
  const { data: user } = useUser();
  const canSeeStock = user?.permissions.includes("stock") ?? false;

  const rangeSwitch = (
    <div className="adm-segmented" role="group" aria-label={t("overview.period")}>
      {RANGES.map((option) => (
        <button
          key={option}
          type="button"
          className={range === option ? "is-active" : ""}
          onClick={() => setRange(option)}
        >
          {t(`overview.ranges.${option}`)}
        </button>
      ))}
    </div>
  );

  if (isError) {
    return (
      <>
        <PageHeader title={t("overview.title")} actions={rangeSwitch} />
        <div className="adm-empty">{t("overview.loadError")}</div>
      </>
    );
  }

  if (isPending) {
    return (
      <>
        <PageHeader title={t("overview.title")} actions={rangeSwitch} />
        <div className="adm-loading">{t("overview.loading")}</div>
      </>
    );
  }

  // The best seller fills the whole bar; the others are relative to it.
  const topRevenue = data.top_products[0]?.revenue_cents ?? 1;

  return (
    <>
      <PageHeader title={t("overview.title")} subtitle={t("overview.subtitle")} actions={rangeSwitch} />

      <section className="adm-kpis">
        <KpiCard label={t("overview.kpis.sales")} kpi={data.kpis.sales_cents} format={moneyShort} />
        <KpiCard label={t("overview.kpis.orders")} kpi={data.kpis.orders} format={count} />
        <KpiCard label={t("overview.kpis.averageTicket")} kpi={data.kpis.average_ticket_cents} format={money} />
        <KpiCard label={t("overview.kpis.returnRate")} kpi={data.kpis.return_rate} format={(value) => `${count(value)}%`} lowerIsBetter />
      </section>

      <section className="adm-card adm-chart-card">
        <div className="adm-card-head">
          <h2>{t(`overview.chartTitles.${range}`)}</h2>
          <div className="adm-legend">
            <span className="is-current">{t("chart.thisPeriod")}</span>
            <span className="is-previous">{t("chart.previous")}</span>
          </div>
        </div>
        <SalesChart points={data.chart} byHour={range === "today"} />
      </section>

      <section className="adm-grid-2">
        <div className="adm-card">
          <div className="adm-card-head">
            <h2>{t("overview.bestSellers")}</h2>
          </div>
          {data.top_products.length === 0 && <p className="adm-muted">{t("overview.noSales")}</p>}
          <ul className="adm-top-list">
            {data.top_products.map((product) => (
              <li key={product.slug}>
                <div className="adm-top-row">
                  <span>{product.name}</span>
                  <strong>{moneyShort(product.revenue_cents)}</strong>
                </div>
                <div className="adm-top-meta">{t("overview.units", { count: product.units })}</div>
                <div className="adm-bar">
                  <span style={{ width: `${(product.revenue_cents / topRevenue) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="adm-card">
          <div className="adm-card-head">
            <h2>{t("overview.recentOrders")}</h2>
            <Link to="/admin/orders" className="adm-link">
              {t("overview.seeAll")}
            </Link>
          </div>
          <ul className="adm-recent-list">
            {data.recent_orders.map((order) => (
              <li key={order.id}>
                <Link to={`/admin/orders/${order.id}`}>
                  <span className="adm-mono">{order.number}</span>
                  <span className="adm-recent-name">
                    {order.customer}
                    <small>{shortDate(order.created_at)}</small>
                  </span>
                  <span className="adm-mono">{money(order.total_cents)}</span>
                  <StatusBadge status={order.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Stock alerts, only for roles that handle stock. */}
      {canSeeStock && data.low_stock.length > 0 && (
        <section className="adm-card">
          <div className="adm-card-head">
            <h2>{t("overview.lowStock", { count: data.badges.low_stock })}</h2>
            <Link to="/admin/products?stock=low" className="adm-link">
              {t("overview.seeAll")}
            </Link>
          </div>
          <ul className="adm-low-list">
            {data.low_stock.map((item) => (
              <li key={item.id}>
                <Link to={`/admin/products/${item.product_slug}`}>
                  <span className="adm-swatch" style={{ background: item.color_hex }} />
                  <span className="adm-recent-name">
                    {item.product_name}
                    <small className="adm-mono">
                      {t("overview.sizeLine", { sku: item.sku, size: item.size_label })}
                    </small>
                  </span>
                  <strong className={item.stock === 0 ? "adm-stock-out" : "adm-stock-low"}>
                    {item.stock === 0 ? t("overview.out") : t("overview.left", { count: item.stock })}
                  </strong>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
