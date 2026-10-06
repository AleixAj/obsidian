import { useState } from "react";
import { useTranslation } from "react-i18next";
import { OrderReturn } from "../../components/account/OrderReturn";
import { useOrders } from "../../hooks/queries";
import { formatPrice } from "../../utils/format";
import { euroFromCents, type ProductMap } from "./helpers";
import { OrderRow } from "./OrderRow";

/** Every order, with a filter by status and the return form under each one. */

export function Orders({ productMap }: { productMap: ProductMap }) {
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
