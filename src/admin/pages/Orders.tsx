import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { OrderStatus } from "../api";
import { AdminIcon } from "../components/AdminIcon";
import { ExportButtons } from "../components/ExportButtons";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { StatusBadge } from "../components/StatusBadge";
import { count, dateTime, money, STATUS_LABELS } from "../format";
import { useAdminOrders } from "../hooks";
import { openRow, pageFromUrl } from "../tables";

const STATUS_TABS: (OrderStatus | "")[] = ["", "paid", "preparing", "shipped", "delivered", "returned", "cancelled", "pending"];

/**
 * Orders list with status tabs, search, pages and CSV export.
 *
 * The filters live in the URL (?status=paid&search=ana&page=2), so the
 * browser back button works and a filtered list can be shared as a link.
 */
export function Orders() {
  const { t } = useTranslation("admin");
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const status = (params.get("status") ?? "") as OrderStatus | "";
  const search = params.get("search") ?? "";
  const page = pageFromUrl(params);

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

  return (
    <>
      <PageHeader
        title={t("orders.title")}
        subtitle={data ? t("orders.count", { count: data.meta.total, total: count(data.meta.total) }) : undefined}
        actions={<ExportButtons section="orders" filters={{ status, search }} />}
      />

      <div className="adm-toolbar">
        <div className="adm-tabs" role="tablist" aria-label={t("orders.filterByStatus")}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab || "all"}
              type="button"
              role="tab"
              aria-selected={status === tab}
              className={status === tab ? "is-active" : ""}
              onClick={() => setFilter("status", tab)}
            >
              {tab ? t(STATUS_LABELS[tab]) : t("common.all")}
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
            placeholder={t("orders.searchPlaceholder")}
            aria-label={t("orders.searchLabel")}
          />
        </form>
      </div>

      <div className={`adm-card adm-table-card${isFetching ? " is-loading" : ""}`}>
        {isPending && <div className="adm-loading">{t("orders.loading")}</div>}
        {isError && <div className="adm-empty">{t("orders.loadError")}</div>}
        {data && data.data.length === 0 && (
          <div className="adm-empty">
            <strong>{t("orders.empty")}</strong>
            <span>{t("orders.emptyHint")}</span>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="adm-table-scroll">
            <table className="adm-table adm-table--cards">
              <thead>
                <tr>
                  <th>{t("common.order")}</th>
                  <th>{t("common.date")}</th>
                  <th>{t("common.customer")}</th>
                  <th className="num">{t("common.items")}</th>
                  <th className="num">{t("common.total")}</th>
                  <th>{t("common.status")}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((order) => (
                  // The whole row opens the order. The link inside is for keyboard users.
                  <tr key={order.id} onClick={openRow(() => navigate(`/admin/orders/${order.id}`))}>
                    <td data-label={t("common.order")}>
                      <Link to={`/admin/orders/${order.id}`} className="adm-mono adm-order-link">
                        {order.number}
                      </Link>
                    </td>
                    <td data-label={t("common.date")} className="adm-muted">{dateTime(order.created_at)}</td>
                    <td data-label={t("common.customer")}>
                      {order.customer?.name ?? t("common.guest")}
                      <small className="adm-cell-sub">{order.email}</small>
                    </td>
                    <td data-label={t("common.items")} className="num">{order.items_count}</td>
                    <td data-label={t("common.total")} className="num adm-mono">{money(order.total_cents)}</td>
                    <td data-label={t("common.status")}>
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
