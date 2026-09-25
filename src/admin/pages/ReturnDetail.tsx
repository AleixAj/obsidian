import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("admin");
  const { id } = useParams();
  const returnId = Number(id);
  const { data: user } = useUser();
  const { data: item, isPending, isError } = useAdminReturn(returnId);
  const action = useReturnAction(returnId);
  const { push } = useToast();
  const [note, setNote] = useState("");
  const [restock, setRestock] = useState(true);

  if (isPending) return <div className="adm-loading">{t("returnDetail.loading")}</div>;
  if (isError) {
    return (
      <div className="adm-empty">
        <strong>{t("returnDetail.notFound")}</strong>
        <Link to="/admin/returns" className="adm-link">
          {t("returnDetail.back")}
        </Link>
      </div>
    );
  }

  function run(kind: "approve" | "reject" | "refund") {
    if (kind === "reject" && !note.trim()) {
      push(t("returnDetail.needReason"), "warn");
      return;
    }
    action.mutate(
      { action: kind, restock, note: note.trim() || undefined },
      {
        onSuccess: () => {
          setNote("");
          push({ approve: t("returnDetail.approved"), reject: t("returnDetail.rejected"), refund: t("returnDetail.refundDone") }[kind]);
        },
        onError: (error) => push(errorMessage(error, t("returnDetail.updateError")), "warn"),
      },
    );
  }

  return (
    <>
      <Link to="/admin/returns" className="adm-back">
        <AdminIcon.ArrowLeft /> {t("returnDetail.backShort")}
      </Link>

      <header className="adm-page-header">
        <div>
          <h1 className="adm-order-title">
            {item.number} <ReturnBadge status={item.status} />
          </h1>
          <p>
            {t("returnDetail.requestedOn", { date: dateTime(item.created_at) })}{" "}
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
              <h2>{t("returnDetail.productsBack")}</h2>
            </div>
            <div className="adm-table-scroll">
              <table className="adm-table adm-table--plain">
                <thead>
                  <tr>
                    <th>{t("common.product")}</th>
                    <th>{t("common.size")}</th>
                    <th>{t("common.colour")}</th>
                    <th className="num">{t("common.units")}</th>
                    <th className="num">{t("common.price")}</th>
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
                <dt>{item.status === "refunded" ? t("returnDetail.refunded") : t("returnDetail.refund")}</dt>
                <dd>{money(item.status === "refunded" ? item.refund_cents : (item.expected_refund_cents ?? 0))}</dd>
              </div>
            </dl>
          </section>

          <section className="adm-card">
            <div className="adm-card-head">
              <h2>{t("returnDetail.reason")}</h2>
            </div>
            <p className="adm-strong">{t(`returns.reasons.${item.reason}`, { defaultValue: item.reason_label })}</p>
            {item.customer_note ? <p className="adm-quote">“{item.customer_note}”</p> : <p className="adm-muted">{t("returnDetail.noComment")}</p>}
            {item.staff_note && (
              <>
                <div className="adm-card-head adm-card-head--spaced">
                  <h2>{t("returnDetail.supportAnswer")}</h2>
                </div>
                <p>{item.staff_note}</p>
              </>
            )}
          </section>
        </div>

        <aside className="adm-detail-side">
          <section className="adm-card">
            <div className="adm-card-head">
              <h2>{t("returnDetail.nextStep")}</h2>
            </div>

            {item.status === "requested" && (
              <div className="adm-form">
                <label className="adm-check">
                  <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} />
                  {t("returnDetail.restock")}
                </label>
                <label>
                  <span className="adm-label-row">
                    {t("returnDetail.noteLabel")} <small>{t("returnDetail.noteRequired")}</small>
                  </span>
                  <textarea
                    className="adm-input adm-textarea"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t("returnDetail.notePlaceholder")}
                    maxLength={500}
                  />
                </label>
                <div className="adm-actions">
                  <button type="button" className="adm-btn adm-btn--gold" onClick={() => run("approve")} disabled={action.isPending}>
                    {t("returnDetail.approve")}
                  </button>
                  <button type="button" className="adm-btn adm-btn--danger" onClick={() => run("reject")} disabled={action.isPending}>
                    {t("returnDetail.reject")}
                  </button>
                </div>
              </div>
            )}

            {item.status === "approved" && (
              <div className="adm-form">
                <p className="adm-muted">
                  {t(item.restock ? "returnDetail.whenArrivesRestock" : "returnDetail.whenArrives", {
                    amount: money(item.expected_refund_cents ?? 0),
                  })}
                </p>
                <button type="button" className="adm-btn adm-btn--gold" onClick={() => run("refund")} disabled={action.isPending}>
                  {t("returnDetail.refundButton", { amount: money(item.expected_refund_cents ?? 0) })}
                </button>
                <p className="adm-muted adm-small">{t("returnDetail.simulated")}</p>
              </div>
            )}

            {item.status === "refunded" && (
              <p className="adm-muted">
                {t("returnDetail.refundedOn", { date: dateTime(item.refunded_at) })}
                <br />
                {t("returnDetail.reference")} <span className="adm-mono">{item.refund_reference}</span>
              </p>
            )}

            {item.status === "rejected" && <p className="adm-muted">{t("returnDetail.rejectedText")}</p>}

            {item.handled_by && <p className="adm-muted adm-small">{t("returnDetail.handledBy", { name: item.handled_by })}</p>}
          </section>

          <section className="adm-card">
            <div className="adm-card-head">
              <h2>{t("common.customer")}</h2>
            </div>
            <p className="adm-strong">{item.customer?.name ?? t("common.guest")}</p>
            <p className="adm-muted">{item.customer?.email}</p>
            {item.customer && user?.permissions.includes("customers") && (
              <Link to={`/admin/customers/${item.customer.id}`} className="adm-link">
                {t("common.viewProfile")}
              </Link>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
