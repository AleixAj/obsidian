import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useUser } from "../../hooks/queries";
import { ApiError } from "../../lib/api";
import type { OrderStatus } from "../api";
import { AdminIcon } from "../components/AdminIcon";
import { StatusBadge } from "../components/StatusBadge";
import { dateTime, money, STATUS_LABELS } from "../format";
import { useAdminOrder, useUpdateOrderStatus } from "../hooks";

/** One order: products, customer, address, status buttons and timeline. */
export function OrderDetail() {
  const { t } = useTranslation("admin");
  const { id } = useParams();
  const orderId = Number(id);
  const { data: user } = useUser();
  const { data: order, isPending, isError } = useAdminOrder(orderId);
  const updateStatus = useUpdateOrderStatus(orderId);
  const { push } = useToast();
  const [note, setNote] = useState("");

  if (isPending) return <div className="adm-loading">{t("orderDetail.loading")}</div>;
  if (isError) {
    return (
      <div className="adm-empty">
        <strong>{t("orderDetail.notFound")}</strong>
        <Link to="/admin/orders" className="adm-link">
          {t("orderDetail.back")}
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
          push(t("orderDetail.changed", { number: order!.number, status: t(STATUS_LABELS[status]).toLowerCase() }));
        },
        onError: (error) => {
          const message = error instanceof ApiError && error.status === 403
            ? t("orderDetail.forbidden")
            : t("orderDetail.updateError");
          push(message, "warn");
        },
      },
    );
  }

  return (
    <>
      <Link to="/admin/orders" className="adm-back">
        <AdminIcon.ArrowLeft /> {t("orders.title")}
      </Link>

      <header className="adm-page-header">
        <div>
          <h1 className="adm-order-title">
            {order.number} <StatusBadge status={order.status} />
          </h1>
          <p>{t("orderDetail.placedOn", { date: dateTime(order.created_at) })}</p>
        </div>
      </header>

      <div className="adm-detail">
        <div className="adm-detail-main">
          <section className="adm-card">
            <div className="adm-card-head">
              <h2>{t("orderDetail.products")}</h2>
            </div>
            <div className="adm-table-scroll">
              <table className="adm-table adm-table--plain">
                <thead>
                  <tr>
                    <th>{t("common.product")}</th>
                    <th>{t("common.size")}</th>
                    <th>{t("common.colour")}</th>
                    <th className="num">{t("orderDetail.qty")}</th>
                    <th className="num">{t("common.price")}</th>
                    <th className="num">{t("common.total")}</th>
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
                <dt>{t("orderDetail.subtotal")}</dt>
                <dd>{money(order.subtotal_cents)}</dd>
              </div>
              <div>
                <dt>{t("orderDetail.shipping")}</dt>
                <dd>{order.shipping_cents === 0 ? t("orderDetail.free") : money(order.shipping_cents)}</dd>
              </div>
              <div className="is-total">
                <dt>{t("common.total")}</dt>
                <dd>{money(order.total_cents)}</dd>
              </div>
            </dl>
          </section>

          <section className="adm-card">
            <div className="adm-card-head">
              <h2>{t("orderDetail.timeline")}</h2>
            </div>
            <ol className="adm-timeline">
              {[...(order.history ?? [])].reverse().map((change, index) => (
                <li key={index}>
                  <StatusBadge status={change.to} />
                  <div>
                    <span>
                      {change.from ? `${t(STATUS_LABELS[change.from])} → ${t(STATUS_LABELS[change.to])}` : t("orderDetail.placed")}
                      <small> · {t("orderDetail.by", { name: change.by })}</small>
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
              <h2>{t("orderDetail.updateStatus")}</h2>
            </div>
            {order.next_statuses.length === 0 ? (
              <p className="adm-muted">{t("orderDetail.closed")}</p>
            ) : actions.length === 0 ? (
              <p className="adm-muted">{t("orderDetail.onlySupport")}</p>
            ) : (
              <div className="adm-form">
                <label>
                  <span className="adm-label-row">
                    {t("common.note")} <small>{t("common.optional")}</small>
                  </span>
                  <input
                    className="adm-input"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder={t("orderDetail.notePlaceholder")}
                    maxLength={255}
                  />
                </label>
                <div className="adm-actions">
                  {actions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`adm-btn ${status === "cancelled" ? "adm-btn--danger" : "adm-btn--gold"}`}
                      onClick={() => changeStatus(status)}
                      disabled={updateStatus.isPending}
                    >
                      {t(`orderDetail.actions.${status}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="adm-card">
            <div className="adm-card-head">
              <h2>{t("common.customer")}</h2>
            </div>
            <p className="adm-strong">{order.customer?.name ?? t("common.guest")}</p>
            <p className="adm-muted">{order.email}</p>
            {order.customer && user?.permissions.includes("customers") && (
              <Link to={`/admin/customers/${order.customer.id}`} className="adm-link">
                {t("common.viewProfile")}
              </Link>
            )}
          </section>

          {order.shipping_address && (
            <section className="adm-card">
              <div className="adm-card-head">
                <h2>{t("orderDetail.shippingAddress")}</h2>
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
