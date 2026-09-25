import { useTranslation } from "react-i18next";
import type { OrderStatus } from "../api";
import { STATUS_LABELS } from "../format";

/** Coloured pill with the order status. Colours are in admin.css. */
export function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation("admin");
  return <span className={`adm-badge adm-badge--${status}`}>{t(STATUS_LABELS[status])}</span>;
}
