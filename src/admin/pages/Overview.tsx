import { useState } from "react";
import { Link } from "react-router-dom";
import type { Range } from "../api";
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { SalesChart } from "../components/SalesChart";
import { StatusBadge } from "../components/StatusBadge";
import { money, moneyShort, shortDate } from "../format";
import { useDashboard } from "../hooks";

const RANGES: { value: Range; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

const RANGE_TITLES: Record<Range, string> = {
  today: "Sales · today by hour",
  "7d": "Sales · last 7 days",
  "30d": "Sales · last 30 days",
};

/** First page of the panel: KPIs, sales chart, best sellers and latest orders. */
export function Overview() {
  const [range, setRange] = useState<Range>("30d");
  const { data, isPending, isError } = useDashboard(range);

  const rangeSwitch = (
    <div className="adm-segmented" role="group" aria-label="Period">
      {RANGES.map((option) => (
        <button
          key={option.value}
          type="button"
          className={range === option.value ? "is-active" : ""}
          onClick={() => setRange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  if (isError) {
    return (
      <>
        <PageHeader title="Overview" actions={rangeSwitch} />
        <div className="adm-empty">Could not load the dashboard.</div>
      </>
    );
  }

  if (isPending) {
    return (
      <>
        <PageHeader title="Overview" actions={rangeSwitch} />
        <div className="adm-loading">Loading numbers…</div>
      </>
    );
  }

  // The best seller fills the whole bar; the others are relative to it.
  const topRevenue = data.top_products[0]?.revenue_cents ?? 1;

  return (
    <>
      <PageHeader title="Overview" subtitle="How the store is doing" actions={rangeSwitch} />

      <section className="adm-kpis">
        <KpiCard label="Sales" kpi={data.kpis.sales_cents} format={moneyShort} />
        <KpiCard label="Orders" kpi={data.kpis.orders} format={(value) => value.toLocaleString("en")} />
        <KpiCard label="Average ticket" kpi={data.kpis.average_ticket_cents} format={money} />
        <KpiCard label="Return rate" kpi={data.kpis.return_rate} format={(value) => `${value}%`} lowerIsBetter />
      </section>

      <section className="adm-card adm-chart-card">
        <div className="adm-card-head">
          <h2>{RANGE_TITLES[range]}</h2>
          <div className="adm-legend">
            <span className="is-current">This period</span>
            <span className="is-previous">Previous</span>
          </div>
        </div>
        <SalesChart points={data.chart} />
      </section>

      <section className="adm-grid-2">
        <div className="adm-card">
          <div className="adm-card-head">
            <h2>Best sellers</h2>
          </div>
          {data.top_products.length === 0 && <p className="adm-muted">No sales in this period yet.</p>}
          <ul className="adm-top-list">
            {data.top_products.map((product) => (
              <li key={product.slug}>
                <div className="adm-top-row">
                  <span>{product.name}</span>
                  <strong>{moneyShort(product.revenue_cents)}</strong>
                </div>
                <div className="adm-top-meta">{product.units} units</div>
                <div className="adm-bar">
                  <span style={{ width: `${(product.revenue_cents / topRevenue) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="adm-card">
          <div className="adm-card-head">
            <h2>Recent orders</h2>
            <Link to="/admin/orders" className="adm-link">
              See all
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
    </>
  );
}
