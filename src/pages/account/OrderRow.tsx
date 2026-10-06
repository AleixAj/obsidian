import { useTranslation } from "react-i18next";
import { Icon } from "../../components/ui/Icon";
import { Placeholder } from "../../components/ui/Placeholder";
import type { ApiOrderDTO } from "../../lib/api";
import { formatPrice } from "../../utils/format";
import { sizedImage } from "../../utils/image";
import { euroFromCents, formatDate, statusLabel, type ProductMap } from "./helpers";

/** `onOpen` shows the arrow button (used on the overview to open the orders section). */
export function OrderRow({ order, productMap, onOpen }: { order: ApiOrderDTO; productMap: ProductMap; onOpen?: () => void }) {
  const { t } = useTranslation("account");
  return (
    <div className="order-card">
      <div className="stack">
        {/* The photos of the first 3 products (an empty box if the product is gone). */}
        {order.items.slice(0, 3).map((item, i) => {
          const p = productMap.get(item.product_slug);
          return (
            <div key={i} className="thumb">
              <Placeholder palette={p?.palette ?? "warm"} corner={false} img={p ? sizedImage(p.img, 200) : null} />
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
      {onOpen && (
        <button
          type="button"
          className="arrow-btn"
          aria-label={t("orderRow.view", { number: order.number })}
          onClick={onOpen}
        >
          <Icon.Arrow />
        </button>
      )}
    </div>
  );
}
