import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { downloadCsv, type OrderStatus } from "../api";
import { AdminIcon } from "../components/AdminIcon";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { StatusBadge } from "../components/StatusBadge";
import { dateTime, money, STATUS_LABELS } from "../format";
import { useAdminOrders } from "../hooks";

const STATUS_TABS: (OrderStatus | "")[] = ["", "paid", "preparing", "shipped", "delivered", "returned", "cancelled", "pending"];

/**
 * Orders list with status tabs, search, pages and CSV export.
 *
 * The filters live in the URL (?status=paid&search=ana&page=2), so the
 * browser back button works and a filtered list can be shared as a link.
 */
export function Orders() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [exporting, setExporting] = useState(false);

  const status = (params.get("status") ?? "") as OrderStatus | "";
  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? 1);

  const { data, isPending, isError, isFetching } = useAdminOrders({ status, search, page });

  /** Changes one filter in the URL and goes back to page 1. */
  function setFilter(key: "status" | "search", value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setParams(next);
  }

  function goToPage(newPage: number) {
    const next = new URLSearchParams(params);
    next.set("page", String(newPage));
    setParams(next);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = new FormData(event.currentTarget).get("search");
    setFilter("search", String(text ?? "").trim());
  }

  async function handleExport() {
    setExporting(true);
    try {
      await downloadCsv("orders", { status, search });
    } catch {
      push("Could not export the orders.", "warn");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={data ? `${data.meta.total.toLocaleString("en")} ${data.meta.total === 1 ? "order" : "orders"}` : undefined}
        actions={
          <button type="button" className="adm-btn" onClick={handleExport} disabled={exporting}>
            <AdminIcon.Download />
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        }
      />

      <div className="adm-toolbar">
        <div className="adm-tabs" role="tablist" aria-label="Filter by status">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab || "all"}
              type="button"
              role="tab"
              aria-selected={status === tab}
              className={status === tab ? "is-active" : ""}
              onClick={() => setFilter("status", tab)}
            >
              {tab ? STATUS_LABELS[tab] : "All"}
            </button>
          ))}
        </div>

        {/* key={search} resets the box when the search changes from outside (top bar). */}
        <form key={search} className="adm-search adm-search--inline" onSubmit={handleSearch} role="search">
          <AdminIcon.Search />
          <input
            type="search"
            name="search"
            defaultValue={search}
            onChange={(event) => {
              // Clearing the box with the "x" shows all orders again.
              if (event.target.value === "") setFilter("search", "");
            }}
            placeholder="Order number, email or name"
            aria-label="Search orders"
          />
        </form>
      </div>

      <div className={`adm-card adm-table-card${isFetching ? " is-loading" : ""}`}>
        {isPending && <div className="adm-loading">Loading orders…</div>}
        {isError && <div className="adm-empty">Could not load the orders.</div>}
        {data && data.data.length === 0 && (
          <div className="adm-empty">
            <strong>No orders found</strong>
            <span>Try another status or search.</span>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="adm-table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th className="num">Items</th>
                  <th className="num">Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((order) => (
                  // The whole row opens the order. The link inside is for keyboard users.
                  <tr key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)}>
                    <td>
                      <Link to={`/admin/orders/${order.id}`} className="adm-mono adm-order-link">
                        {order.number}
                      </Link>
                    </td>
                    <td className="adm-muted">{dateTime(order.created_at)}</td>
                    <td>
                      {order.customer?.name ?? "Guest"}
                      <small className="adm-cell-sub">{order.email}</small>
                    </td>
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

        {data && <Pagination page={page} lastPage={data.meta.last_page} onChange={goToPage} />}
      </div>
    </>
  );
}
