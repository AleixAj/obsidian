import { useState, type FormEvent } from "react";
import { useRequestReturn } from "../../hooks/queries";
import { ApiError, type ApiOrderDTO, type ReturnRequestPayload } from "../../lib/api";
import { formatPrice } from "../../utils/format";

const REASONS: { value: ReturnRequestPayload["reason"]; label: string }[] = [
  { value: "wrong_size", label: "Wrong size" },
  { value: "damaged", label: "Arrived damaged" },
  { value: "not_as_described", label: "Not as described" },
  { value: "changed_mind", label: "Changed my mind" },
  { value: "other", label: "Other" },
];

const STATUS_TEXT: Record<NonNullable<ApiOrderDTO["return"]>["status"], string> = {
  requested: "We received your return request. We'll review it in 1–2 days.",
  approved: "Return approved. Send the parcel and we'll refund you when it arrives.",
  rejected: "We couldn't accept this return.",
  refunded: "Refund done",
};

/**
 * Under each order in "Your orders": the return status, or a
 * "Request a return" button that opens a small form.
 */
export function OrderReturn({ order }: { order: ApiOrderDTO }) {
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
    const text = STATUS_TEXT[order.return.status];
    return (
      <div className={`order-return is-${order.return.status}`}>
        <strong>Return {order.return.number}</strong> · {text}
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
          Request a return ↗
        </button>
        <span> Free returns within 30 days of delivery.</span>
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
      setError("Choose at least one piece to send back.");
      return;
    }

    request.mutate(
      { items, reason, note: note.trim() || undefined },
      {
        onSuccess: () => setOpen(false),
        onError: (err) => {
          const payload = err instanceof ApiError ? (err.payload as { message?: string } | undefined) : undefined;
          setError(payload?.message ?? "Could not send the request. Try again.");
        },
      },
    );
  }

  return (
    <form className="order-return-form" onSubmit={handleSubmit}>
      <div className="order-return-title">Which pieces are you sending back?</div>
      {order.items.map((item) => (
        <label key={item.id} className="order-return-line">
          <span>
            {item.product_name} <small>· size {item.size_label ?? "—"}</small>
          </span>
          <select
            value={units[item.id]}
            onChange={(e) => setUnits({ ...units, [item.id]: Number(e.target.value) })}
            aria-label={`Units of ${item.product_name}`}
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
        Reason
        <select value={reason} onChange={(e) => setReason(e.target.value as ReturnRequestPayload["reason"])}>
          {REASONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="order-return-field">
        Comment <small>(optional)</small>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} />
      </label>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <div className="order-return-actions">
        <button type="submit" className="btn-submit" disabled={request.isPending}>
          {request.isPending ? "Sending…" : "Send request"}
        </button>
        <button type="button" className="social-btn" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
