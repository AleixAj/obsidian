import type { OrderStatus } from "../api";
import { STATUS_LABELS } from "../format";

/** Coloured pill with the order status. Colours are in admin.css. */
export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`adm-badge adm-badge--${status}`}>{STATUS_LABELS[status]}</span>;
}
