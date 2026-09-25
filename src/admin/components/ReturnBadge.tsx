import { useTranslation } from "react-i18next";
import type { ReturnStatus } from "../api";
import { RETURN_STATUS_LABELS } from "../format";

/** Coloured pill with the return status. Colours are in admin.css. */
export function ReturnBadge({ status }: { status: ReturnStatus }) {
  const { t } = useTranslation("admin");
  return <span className={`adm-badge adm-badge--return-${status}`}>{t(RETURN_STATUS_LABELS[status])}</span>;
}
