import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { ReturnStatus } from "../api";
import { AdminIcon } from "../components/AdminIcon";
import { ExportButtons } from "../components/ExportButtons";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { ReturnBadge } from "../components/ReturnBadge";
import { dateTime, money, RETURN_STATUS_LABELS } from "../format";
import { useAdminReturns } from "../hooks";

const TABS: (ReturnStatus | "")[] = ["requested", "approved", "refunded", "rejected", ""];

/**
 * Returns list. It opens on "To review" because that's the work waiting
 * for customer support.
 */
export function Returns() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  // No ?status in the URL → show "To review". "all" shows everything.
  const statusParam = params.get("status");
  const status = (statusParam === null ? "requested" : statusParam === "all" ? "" : statusParam) as ReturnStatus | "";
  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? 1);

  const { data, isPending, isError, isFetching } = useAdminReturns({ status, search, page });

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    if (key === "search" && !value) next.delete("search");
    if (key !== "page") next.delete("page");
    setParams(next);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setParam("search", String(new FormData(event.currentTarget).get("search") ?? "").trim());
  }

  return (
    <>
      <PageHeader
        title="Returns"
        subtitle="Approve, reject and refund what customers send back"
        actions={<ExportButtons section="returns" filters={{ status, search }} />}
      />

      <div className="adm-toolbar">
        <div className="adm-tabs" role="tablist" aria-label="Filter by status">
          {TABS.map((tab) => (
            <button
              key={tab || "all"}
              type="button"
              role="tab"
              aria-selected={status === tab}
              className={status === tab ? "is-active" : ""}
              onClick={() => setParam("status", tab || "all")}
            >
              {tab ? RETURN_STATUS_LABELS[tab] : "All"}
            </button>
          ))}
        </div>

        <form key={search} className="adm-search adm-search--inline" onSubmit={handleSearch} role="search">
          <AdminIcon.Search />
          <input
            type="search"
            name="search"
            defaultValue={search}
            onChange={(event) => {
              if (event.target.value === "") setParam("search", "");
            }}
            placeholder="Return, order or customer"
            aria-label="Search returns"
          />
        </form>
      </div>

      <div className={`adm-card adm-table-card${isFetching ? " is-loading" : ""}`}>
        {isPending && <div className="adm-loading">Loading returns…</div>}
        {isError && <div className="adm-empty">Could not load the returns.</div>}
        {data && data.data.length === 0 && (
          <div className="adm-empty">
            <strong>{status === "requested" ? "Nothing to review" : "No returns found"}</strong>
            <span>{status === "requested" ? "All caught up." : "Try another status or search."}</span>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="adm-table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Return</th>
                  <th>Requested</th>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Reason</th>
                  <th className="num">Units</th>
                  <th className="num">Refund</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((item) => (
                  <tr key={item.id} onClick={() => navigate(`/admin/returns/${item.id}`)}>
                    <td>
                      <Link to={`/admin/returns/${item.id}`} className="adm-mono adm-order-link">
                        {item.number}
                      </Link>
                    </td>
                    <td className="adm-muted">{dateTime(item.created_at)}</td>
                    <td className="adm-mono">{item.order?.number}</td>
                    <td>{item.customer?.name ?? "—"}</td>
                    <td className="adm-muted">{item.reason_label}</td>
                    <td className="num">{item.units}</td>
                    <td className="num adm-mono">{item.status === "refunded" ? money(item.refund_cents) : "—"}</td>
                    <td>
                      <ReturnBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && <Pagination page={page} lastPage={data.meta.last_page} onChange={(p) => setParam("page", String(p))} />}
      </div>
    </>
  );
}
