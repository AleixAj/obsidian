import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useRequestReturn } from "../../hooks/queries";
import { ApiError, type ApiOrderDTO, type ReturnRequestPayload } from "../../lib/api";
import { formatPrice } from "../../utils/format";
import { catalogSize } from "../../i18n/catalog";

// The label of each reason is in account.json, under "returns.reasons".
const REASONS: ReturnRequestPayload["reason"][] = ["wrong_size", "damaged", "not_as_described", "changed_mind", "other"];

/**
 * Under each order in "Your orders": the return status, or a
 * "Request a return" button that opens a small form.
 */
export function OrderReturn({ order }: { order: ApiOrderDTO }) {
  const { t } = useTranslation("account");
  const [open, setOpen] = useState(false);
  // Units to send back, by order item id. Starts with everything.
  const [units, setUnits] = useState<Record<number, number>>(() =>
    Object.fromEntries(order.items.map((item) => [item.id, item.quantity])),
  );
  const [reason, setReason] = useState<ReturnRequestPayload["reason"]>("wrong_size");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const request = useRequestReturn(order.id);

  // A return already exists: show where it is.
  if (order.return && !order.can_return) {
    const text = t(`returns.status.${order.return.status}`);
    return (
      <div className={`order-return is-${order.return.status}`}>
        <strong>{t("returns.return", { number: order.return.number })}</strong> · {text}
        {order.return.status === "refunded" && ` · ${formatPrice(order.return.refund_cents / 100)}`}
        {order.return.status === "rejected" && order.return.staff_note && <em> “{order.return.staff_note}”</em>}
      </div>
    );
  }

  if (!order.can_return) return null;

  if (!open) {
    return (
      <div className="order-return">
        <button type="button" className="order-return-link" onClick={() => setOpen(true)}>
          {t("returns.request")}
        </button>
        <span>{t("returns.freeReturns")}</span>
      </div>
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const items = Object.entries(units)
      .filter(([, quantity]) => quantity > 0)
      .map(([id, quantity]) => ({ order_item_id: Number(id), quantity }));

    if (items.length === 0) {
      setError(t("returns.errors.noItems"));
      return;
    }

    request.mutate(
      { items, reason, note: note.trim() || undefined },
      {
        onSuccess: () => setOpen(false),
        onError: (err) => {
          const payload = err instanceof ApiError ? (err.payload as { message?: string } | undefined) : undefined;
          setError(payload?.message ?? t("returns.errors.failed"));
        },
      },
    );
  }

  return (
    <form className="order-return-form" onSubmit={handleSubmit}>
      <div className="order-return-title">{t("returns.form.title")}</div>
      {order.items.map((item) => (
        <label key={item.id} className="order-return-line">
          <span>
            {item.product_name} <small>{t("returns.form.size", { size: item.size_label ? catalogSize(item.size_label) : "—" })}</small>
          </span>
          <select
            value={units[item.id]}
            onChange={(e) => setUnits({ ...units, [item.id]: Number(e.target.value) })}
            aria-label={t("returns.form.units", { name: item.product_name })}
          >
            {Array.from({ length: item.quantity + 1 }, (_, n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      ))}

      <label className="order-return-field">
        {t("returns.form.reason")}
        <select value={reason} onChange={(e) => setReason(e.target.value as ReturnRequestPayload["reason"])}>
          {REASONS.map((value) => (
            <option key={value} value={value}>
              {t(`returns.reasons.${value}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="order-return-field">
        {t("returns.form.comment")}<small>{t("returns.form.optional")}</small>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} />
      </label>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <div className="order-return-actions">
        <button type="submit" className="btn-submit" disabled={request.isPending}>
          {request.isPending ? t("returns.form.sending") : t("returns.form.send")}
        </button>
        <button type="button" className="social-btn" onClick={() => setOpen(false)}>
          {t("returns.form.cancel")}
        </button>
      </div>
    </form>
  );
}
