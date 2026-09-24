import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useUser } from "../../hooks/queries";
import { AdminIcon } from "../components/AdminIcon";
import { ReturnBadge } from "../components/ReturnBadge";
import { errorMessage } from "../errors";
import { dateTime, money } from "../format";
import { useAdminReturn, useReturnAction } from "../hooks";

/**
 * One return: what comes back, why, and the buttons for each step.
 *   To review → Approve (or Reject) → Refund
 */
export function ReturnDetail() {
  const { id } = useParams();
  const returnId = Number(id);
  const { data: user } = useUser();
  const { data: item, isPending, isError } = useAdminReturn(returnId);
  const action = useReturnAction(returnId);
  const { push } = useToast();
  const [note, setNote] = useState("");
  const [restock, setRestock] = useState(true);

  if (isPending) return <div className="adm-loading">Loading return…</div>;
  if (isError) {
    return (
      <div className="adm-empty">
        <strong>Return not found</strong>
        <Link to="/admin/returns" className="adm-link">
          Back to returns
        </Link>
      </div>
    );
  }

  function run(kind: "approve" | "reject" | "refund") {
    if (kind === "reject" && !note.trim()) {
      push("Write a reason for the customer before rejecting.", "warn");
      return;
    }
    action.mutate(
      { action: kind, restock, note: note.trim() || undefined },
      {
        onSuccess: () => {
          setNote("");
          push({ approve: "Return approved.", reject: "Return rejected.", refund: "Refund done." }[kind]);
        },
        onError: (error) => push(errorMessage(error, "Could not update the return."), "warn"),
      },
    );
  }

  return (
    <>
      <Link to="/admin/returns" className="adm-back">
        <AdminIcon.ArrowLeft /> Returns
      </Link>

      <header className="adm-page-header">
        <div>
          <h1 className="adm-order-title">
            {item.number} <ReturnBadge status={item.status} />
          </h1>
          <p>
            Requested on {dateTime(item.created_at)} · order{" "}
            {item.order && (
              <Link to={`/admin/orders/${item.order.id}`} className="adm-link">
                {item.order.number}
              </Link>
            )}
          </p>
        </div>
      </header>

      <div className="adm-detail">
        <div className="adm-detail-main">
          <section className="adm-card">
            <div className="adm-card-head">
              <h2>Products coming back</h2>
            </div>
            <div className="adm-table-scroll">
              <table className="adm-table adm-table--plain">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Size</th>
                    <th>Colour</th>
                    <th className="num">Units</th>
                    <th className="num">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {item.items?.map((line) => (
                    <tr key={line.id}>
                      <td>{line.product_name}</td>
                      <td className="adm-mono">{line.size_label ?? "—"}</td>
                      <td>{line.color_hex && <span className="adm-swatch" style={{ background: line.color_hex }} />}</td>
                      <td className="num">{line.quantity}</td>
                      <td className="num adm-mono">{money(line.unit_price_cents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="adm-totals">
              <div className="is-total">
                <dt>{item.status === "refunded" ? "Refunded" : "Refund"}</dt>
                <dd>{money(item.status === "refunded" ? item.refund_cents : (item.expected_refund_cents ?? 0))}</dd>
              </div>
            </dl>
          </section>

          <section className="adm-card">
            <div className="adm-card-head">
              <h2>Reason</h2>
            </div>
            <p className="adm-strong">{item.reason_label}</p>
            {item.customer_note ? <p className="adm-quote">“{item.customer_note}”</p> : <p className="adm-muted">No comment from the customer.</p>}
            {item.staff_note && (
              <>
                <div className="adm-card-head adm-card-head--spaced">
                  <h2>Answer from support</h2>
                </div>
                <p>{item.staff_note}</p>
              </>
            )}
          </section>
        </div>

        <aside className="adm-detail-side">
          <section className="adm-card">
            <div className="adm-card-head">
              <h2>Next step</h2>
            </div>

            {item.status === "requested" && (
              <div className="adm-form">
                <label className="adm-check">
                  <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} />
                  Put the units back in stock
                </label>
                <textarea
                  className="adm-input adm-textarea"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Note for the customer (required to reject)"
                  maxLength={500}
                  aria-label="Note"
                />
                <div className="adm-actions">
                  <button type="button" className="adm-btn adm-btn--gold" onClick={() => run("approve")} disabled={action.isPending}>
                    Approve return
                  </button>
                  <button type="button" className="adm-btn adm-btn--danger" onClick={() => run("reject")} disabled={action.isPending}>
                    Reject
                  </button>
                </div>
              </div>
            )}

            {item.status === "approved" && (
              <div className="adm-form">
                <p className="adm-muted">
                  When the parcel arrives, refund {money(item.expected_refund_cents ?? 0)} to the customer
                  {item.restock ? " and the units go back to stock." : "."}
                </p>
                <button type="button" className="adm-btn adm-btn--gold" onClick={() => run("refund")} disabled={action.isPending}>
                  Refund {money(item.expected_refund_cents ?? 0)}
                </button>
                <p className="adm-muted adm-small">Payments are simulated in this project: no real money moves.</p>
              </div>
            )}

            {item.status === "refunded" && (
              <p className="adm-muted">
                Refunded {dateTime(item.refunded_at)}.<br />
                Reference <span className="adm-mono">{item.refund_reference}</span>
              </p>
            )}

            {item.status === "rejected" && <p className="adm-muted">This return was rejected. Nothing else to do.</p>}

            {item.handled_by && <p className="adm-muted adm-small">Handled by {item.handled_by}</p>}
          </section>

          <section className="adm-card">
            <div className="adm-card-head">
              <h2>Customer</h2>
            </div>
            <p className="adm-strong">{item.customer?.name ?? "Guest"}</p>
            <p className="adm-muted">{item.customer?.email}</p>
            {item.customer && user?.permissions.includes("customers") && (
              <Link to={`/admin/customers/${item.customer.id}`} className="adm-link">
                View profile →
              </Link>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
