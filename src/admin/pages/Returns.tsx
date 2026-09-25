import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("admin");
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
        title={t("returns.title")}
        subtitle={t("returns.subtitle")}
        actions={<ExportButtons section="returns" filters={{ status, search }} />}
      />

      <div className="adm-toolbar">
        <div className="adm-tabs" role="tablist" aria-label={t("returns.filterByStatus")}>
          {TABS.map((tab) => (
            <button
              key={tab || "all"}
              type="button"
              role="tab"
              aria-selected={status === tab}
              className={status === tab ? "is-active" : ""}
              onClick={() => setParam("status", tab || "all")}
            >
              {tab ? t(RETURN_STATUS_LABELS[tab]) : t("common.all")}
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
            placeholder={t("returns.searchPlaceholder")}
            aria-label={t("returns.searchLabel")}
          />
        </form>
      </div>

      <div className={`adm-card adm-table-card${isFetching ? " is-loading" : ""}`}>
        {isPending && <div className="adm-loading">{t("returns.loading")}</div>}
        {isError && <div className="adm-empty">{t("returns.loadError")}</div>}
        {data && data.data.length === 0 && (
          <div className="adm-empty">
            <strong>{status === "requested" ? t("returns.nothingToReview") : t("returns.empty")}</strong>
            <span>{status === "requested" ? t("returns.allCaughtUp") : t("returns.emptyHint")}</span>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="adm-table-scroll">
            <table className="adm-table adm-table--cards">
              <thead>
                <tr>
                  <th>{t("returns.columns.return")}</th>
                  <th>{t("returns.columns.requested")}</th>
                  <th>{t("common.order")}</th>
                  <th>{t("common.customer")}</th>
                  <th>{t("returns.columns.reason")}</th>
                  <th className="num">{t("common.units")}</th>
                  <th className="num">{t("returns.columns.refund")}</th>
                  <th>{t("common.status")}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((item) => (
                  <tr key={item.id} onClick={() => navigate(`/admin/returns/${item.id}`)}>
                    <td data-label={t("returns.columns.return")}>
                      <Link to={`/admin/returns/${item.id}`} className="adm-mono adm-order-link">
                        {item.number}
                      </Link>
                    </td>
                    <td data-label={t("returns.columns.requested")} className="adm-muted">{dateTime(item.created_at)}</td>
                    <td data-label={t("common.order")} className="adm-mono">{item.order?.number}</td>
                    <td data-label={t("common.customer")}>{item.customer?.name ?? "—"}</td>
                    <td data-label={t("returns.columns.reason")} className="adm-muted">
                      {t(`returns.reasons.${item.reason}`, { defaultValue: item.reason_label })}
                    </td>
                    <td data-label={t("common.units")} className="num">{item.units}</td>
                    <td data-label={t("returns.columns.refund")} className="num adm-mono">{item.status === "refunded" ? money(item.refund_cents) : "—"}</td>
                    <td data-label={t("common.status")}>
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
