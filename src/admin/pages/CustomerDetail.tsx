import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { mediaUrl } from "../../lib/api";
import { AdminIcon } from "../components/AdminIcon";
import { StatusBadge } from "../components/StatusBadge";
import { dateTime, initials, money, monthYear } from "../format";
import { useAdminCustomer } from "../hooks";

/** Customer profile: numbers, addresses and full order history. */
export function CustomerDetail() {
  const { t } = useTranslation("admin");
  const { id } = useParams();
  const { data: customer, isPending, isError } = useAdminCustomer(Number(id));

  if (isPending) return <div className="adm-loading">{t("customerDetail.loading")}</div>;
  if (isError) {
    return (
      <div className="adm-empty">
        <strong>{t("customerDetail.notFound")}</strong>
        <Link to="/admin/customers" className="adm-link">
          {t("customerDetail.back")}
        </Link>
      </div>
    );
  }

  const stats = [
    { label: t("customerDetail.stats.orders"), value: String(customer.stats.orders) },
    { label: t("customerDetail.stats.spent"), value: money(customer.stats.spent_cents) },
    { label: t("customerDetail.stats.averageTicket"), value: money(customer.stats.average_ticket_cents) },
    { label: t("customerDetail.stats.returns"), value: String(customer.stats.returns) },
  ];

  return (
    <>
      <Link to="/admin/customers" className="adm-back">
        <AdminIcon.ArrowLeft /> {t("customerDetail.backShort")}
      </Link>

      <header className="adm-page-header">
        <div className="adm-customer-head">
          <span className="adm-avatar adm-avatar--lg">
            {customer.avatar_url ? <img src={mediaUrl(customer.avatar_url)} alt="" referrerPolicy="no-referrer" /> : initials(customer.name)}
          </span>
          <div>
            <h1>{customer.name}</h1>
            <p>
              {t("customerDetail.intro", {
                email: customer.email,
                since: customer.created_at ? monthYear(customer.created_at) : "—",
                provider: customer.signed_up_with,
              })}
            </p>
          </div>
        </div>
      </header>

      <section className="adm-kpis">
        {stats.map((stat) => (
          <div key={stat.label} className="adm-card adm-kpi">
            <span className="adm-kpi-label">{stat.label}</span>
            <strong className="adm-kpi-value">{stat.value}</strong>
          </div>
        ))}
      </section>

      <div className="adm-detail">
        <section className="adm-card adm-table-card adm-detail-main">
          <div className="adm-card-head adm-card-head--padded">
            <h2>{t("customerDetail.orderHistory")}</h2>
          </div>
          {customer.orders.length === 0 ? (
            <div className="adm-empty">{t("customerDetail.noOrders")}</div>
          ) : (
            <div className="adm-table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>{t("common.order")}</th>
                    <th>{t("common.date")}</th>
                    <th className="num">{t("common.items")}</th>
                    <th className="num">{t("common.total")}</th>
                    <th>{t("common.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link to={`/admin/orders/${order.id}`} className="adm-mono adm-order-link">
                          {order.number}
                        </Link>
                      </td>
                      <td className="adm-muted">{dateTime(order.created_at)}</td>
                      <td className="num">{order.items_count}</td>
                      <td className="num adm-mono">{money(order.total_cents)}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="adm-detail-side">
          <section className="adm-card">
            <div className="adm-card-head">
              <h2>{t("customerDetail.addresses")}</h2>
            </div>
            {customer.addresses.length === 0 && <p className="adm-muted">{t("customerDetail.noAddresses")}</p>}
            {customer.addresses.map((address) => (
              <address key={address.id} className="adm-address adm-address--block">
                <strong>
                  {address.label ?? t("customerDetail.address")} {address.is_default && <span className="adm-pill is-on">{t("customerDetail.default")}</span>}
                </strong>
                <br />
                {address.full_name}
                <br />
                {address.line1}
                <br />
                {address.postal_code} {address.city}, {address.country}
                {address.phone && (
                  <>
                    <br />
                    <span className="adm-muted">{address.phone}</span>
                  </>
                )}
              </address>
            ))}
          </section>

          <section className="adm-card">
            <div className="adm-card-head">
              <h2>{t("customerDetail.activity")}</h2>
            </div>
            <p className="adm-muted">{t("customerDetail.lastSignIn", { date: dateTime(customer.last_login_at) })}</p>
          </section>
        </aside>
      </div>
    </>
  );
}
