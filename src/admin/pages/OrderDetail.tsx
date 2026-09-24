import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useUser } from "../../hooks/queries";
import { ApiError } from "../../lib/api";
import type { OrderStatus } from "../api";
import { AdminIcon } from "../components/AdminIcon";
import { StatusBadge } from "../components/StatusBadge";
import { dateTime, money, STATUS_LABELS } from "../format";
import { useAdminOrder, useUpdateOrderStatus } from "../hooks";

/** Text for the buttons that move an order forward. */
const ACTION_LABELS: Record<OrderStatus, string> = {
  pending: "Mark as pending",
  paid: "Mark as paid",
  preparing: "Start preparing",
  shipped: "Mark as shipped",
  delivered: "Mark as delivered",
  returned: "Mark as returned",
  cancelled: "Cancel order",
};

/** One order: products, customer, address, status buttons and timeline. */
export function OrderDetail() {
  const { id } = useParams();
  const orderId = Number(id);
  const { data: user } = useUser();
  const { data: order, isPending, isError } = useAdminOrder(orderId);
  const updateStatus = useUpdateOrderStatus(orderId);
  const { push } = useToast();
  const [note, setNote] = useState("");

  if (isPending) return <div className="adm-loading">Loading order…</div>;
  if (isError) {
    return (
      <div className="adm-empty">
        <strong>Order not found</strong>
        <Link to="/admin/orders" className="adm-link">
          Back to orders
        </Link>
      </div>
    );
  }

  // "Returned" needs the returns permission (warehouse doesn't have it).
  // The API checks this too; here we just hide the button.
  const actions = order.next_statuses.filter(
    (status) => status !== "returned" || user?.permissions.includes("returns"),
  );

  function changeStatus(status: OrderStatus) {
    updateStatus.mutate(
      { status, note: note.trim() || undefined },
      {
        onSuccess: () => {
          setNote("");
          push(`Order ${order!.number} is now ${STATUS_LABELS[status].toLowerCase()}.`);
        },
        onError: (error) => {
          const message = error instanceof ApiError && error.status === 403
            ? "Your role can't make this change."
            : "Could not update the order.";
          push(message, "warn");
        },
      },
    );
  }

  return (
    <>
      <Link to="/admin/orders" className="adm-back">
        <AdminIcon.ArrowLeft /> Orders
      </Link>

      <header className="adm-page-header">
        <div>
          <h1 className="adm-order-title">
            {order.number} <StatusBadge status={order.status} />
          </h1>
          <p>Placed on {dateTime(order.created_at)}</p>
        </div>
      </header>

      <div className="adm-detail">
        <div className="adm-detail-main">
          <section className="adm-card">
            <div className="adm-card-head">
              <h2>Products</h2>
            </div>
            <div className="adm-table-scroll">
              <table className="adm-table adm-table--plain">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Size</th>
                    <th>Colour</th>
                    <th className="num">Qty</th>
                    <th className="num">Price</th>
                    <th className="num">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td className="adm-mono">{item.size_label ?? "—"}</td>
                      <td>
                        {item.color_hex && (
                          <span className="adm-swatch" style={{ background: item.color_hex }} title={item.color_hex} />
                        )}
                      </td>
                      <td className="num">{item.quantity}</td>
                      <td className="num adm-mono">{money(item.unit_price_cents)}</td>
                      <td className="num adm-mono">{money(item.line_total_cents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="adm-totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{money(order.subtotal_cents)}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>{order.shipping_cents === 0 ? "Free" : money(order.shipping_cents)}</dd>
              </div>
              <div className="is-total">
                <dt>Total</dt>
                <dd>{money(order.total_cents)}</dd>
              </div>
            </dl>
          </section>

          <section className="adm-card">
            <div className="adm-card-head">
              <h2>Timeline</h2>
            </div>
            <ol className="adm-timeline">
              {[...(order.history ?? [])].reverse().map((change, index) => (
                <li key={index}>
                  <StatusBadge status={change.to} />
                  <div>
                    <span>
                      {change.from ? `${STATUS_LABELS[change.from]} → ${STATUS_LABELS[change.to]}` : "Order placed"}
                      <small> · by {change.by}</small>
                    </span>
                    {change.note && <em>“{change.note}”</em>}
                  </div>
                  <time className="adm-muted">{dateTime(change.at)}</time>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="adm-detail-side">
          <section className="adm-card">
            <div className="adm-card-head">
              <h2>Update status</h2>
            </div>
            {order.next_statuses.length === 0 ? (
              <p className="adm-muted">This order is closed. No more changes.</p>
            ) : actions.length === 0 ? (
              <p className="adm-muted">Only customer support can mark this order as returned.</p>
            ) : (
              <>
                <input
                  className="adm-input"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Note (optional), e.g. tracking number"
                  maxLength={255}
                  aria-label="Note"
                />
                <div className="adm-actions">
                  {actions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`adm-btn ${status === "cancelled" ? "adm-btn--danger" : "adm-btn--gold"}`}
                      onClick={() => changeStatus(status)}
                      disabled={updateStatus.isPending}
                    >
                      {ACTION_LABELS[status]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="adm-card">
            <div className="adm-card-head">
              <h2>Customer</h2>
            </div>
            <p className="adm-strong">{order.customer?.name ?? "Guest"}</p>
            <p className="adm-muted">{order.email}</p>
            {order.customer && user?.permissions.includes("customers") && (
              <Link to={`/admin/customers/${order.customer.id}`} className="adm-link">
                View profile →
              </Link>
            )}
          </section>

          {order.shipping_address && (
            <section className="adm-card">
              <div className="adm-card-head">
                <h2>Shipping address</h2>
              </div>
              <address className="adm-address">
                {order.shipping_address.full_name}
                <br />
                {order.shipping_address.line1}
                {order.shipping_address.line2 && (
                  <>
                    <br />
                    {order.shipping_address.line2}
                  </>
                )}
                <br />
                {order.shipping_address.postal_code} {order.shipping_address.city}, {order.shipping_address.country}
                {order.shipping_address.phone && (
                  <>
                    <br />
                    <span className="adm-muted">{order.shipping_address.phone}</span>
                  </>
                )}
              </address>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
