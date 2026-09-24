import { Link, useParams } from "react-router-dom";
import { mediaUrl } from "../../lib/api";
import { AdminIcon } from "../components/AdminIcon";
import { StatusBadge } from "../components/StatusBadge";
import { dateTime, initials, money, monthYear } from "../format";
import { useAdminCustomer } from "../hooks";

/** Customer profile: numbers, addresses and full order history. */
export function CustomerDetail() {
  const { id } = useParams();
  const { data: customer, isPending, isError } = useAdminCustomer(Number(id));

  if (isPending) return <div className="adm-loading">Loading customer…</div>;
  if (isError) {
    return (
      <div className="adm-empty">
        <strong>Customer not found</strong>
        <Link to="/admin/customers" className="adm-link">
          Back to customers
        </Link>
      </div>
    );
  }

  const stats = [
    { label: "Orders", value: String(customer.stats.orders) },
    { label: "Total spent", value: money(customer.stats.spent_cents) },
    { label: "Average ticket", value: money(customer.stats.average_ticket_cents) },
    { label: "Returns", value: String(customer.stats.returns) },
  ];

  return (
    <>
      <Link to="/admin/customers" className="adm-back">
        <AdminIcon.ArrowLeft /> Customers
      </Link>

      <header className="adm-page-header">
        <div className="adm-customer-head">
          <span className="adm-avatar adm-avatar--lg">
            {customer.avatar_url ? <img src={mediaUrl(customer.avatar_url)} alt="" referrerPolicy="no-referrer" /> : initials(customer.name)}
          </span>
          <div>
            <h1>{customer.name}</h1>
            <p>
              {customer.email} · customer since {customer.created_at ? monthYear(customer.created_at) : "—"} · signed up
              with {customer.signed_up_with}
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
            <h2>Order history</h2>
          </div>
          {customer.orders.length === 0 ? (
            <div className="adm-empty">No orders yet.</div>
          ) : (
            <div className="adm-table-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th className="num">Items</th>
                    <th className="num">Total</th>
                    <th>Status</th>
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
              <h2>Addresses</h2>
            </div>
            {customer.addresses.length === 0 && <p className="adm-muted">No saved addresses.</p>}
            {customer.addresses.map((address) => (
              <address key={address.id} className="adm-address adm-address--block">
                <strong>
                  {address.label ?? "Address"} {address.is_default && <span className="adm-pill is-on">Default</span>}
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
              <h2>Activity</h2>
            </div>
            <p className="adm-muted">Last sign in: {dateTime(customer.last_login_at)}</p>
          </section>
        </aside>
      </div>
    </>
  );
}
