import type { ReturnStatus } from "../api";
import { RETURN_STATUS_LABELS } from "../format";

/** Coloured pill with the return status. Colours are in admin.css. */
export function ReturnBadge({ status }: { status: ReturnStatus }) {
  return <span className={`adm-badge adm-badge--return-${status}`}>{RETURN_STATUS_LABELS[status]}</span>;
}
