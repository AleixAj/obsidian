import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { CustomerFilters } from "../api";
import { AdminIcon } from "../components/AdminIcon";
import { ExportButtons } from "../components/ExportButtons";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { initials, money, monthYear, shortDate } from "../format";
import { useAdminCustomers } from "../hooks";

type Sort = NonNullable<CustomerFilters["sort"]>;

// Texts in admin.json: "customers.sorts.recent"...
const SORTS: Sort[] = ["recent", "spent", "orders"];

/** Customers list with search, sorting and CSV export. */
export function Customers() {
  const { t } = useTranslation("admin");
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const search = params.get("search") ?? "";
  const sort = (params.get("sort") ?? "recent") as Sort;
  const page = Number(params.get("page") ?? 1);

  const { data, isPending, isError, isFetching } = useAdminCustomers({ search, sort, page });

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = new FormData(event.currentTarget).get("search");
    setParam("search", String(text ?? "").trim());
  }

  return (
    <>
      <PageHeader
        title={t("customers.title")}
        subtitle={data ? t("customers.count", { count: data.meta.total }) : undefined}
        actions={<ExportButtons section="customers" filters={{ search, sort }} />}
      />

      <div className="adm-toolbar">
        <div className="adm-tabs" role="tablist" aria-label={t("customers.sortLabel")}>
          {SORTS.map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={sort === option}
              className={sort === option ? "is-active" : ""}
              onClick={() => setParam("sort", option)}
            >
              {t(`customers.sorts.${option}`)}
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
            placeholder={t("customers.searchPlaceholder")}
            aria-label={t("customers.searchLabel")}
          />
        </form>
      </div>

      <div className={`adm-card adm-table-card${isFetching ? " is-loading" : ""}`}>
        {isPending && <div className="adm-loading">{t("customers.loading")}</div>}
        {isError && <div className="adm-empty">{t("customers.loadError")}</div>}
        {data && data.data.length === 0 && (
          <div className="adm-empty">
            <strong>{t("customers.empty")}</strong>
            <span>{t("customers.emptyHint")}</span>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="adm-table-scroll">
            <table className="adm-table adm-table--cards">
              <thead>
                <tr>
                  <th>{t("common.customer")}</th>
                  <th className="num">{t("customers.columns.orders")}</th>
                  <th className="num">{t("customers.columns.spent")}</th>
                  <th>{t("customers.columns.lastOrder")}</th>
                  <th>{t("customers.columns.since")}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((customer) => (
                  <tr key={customer.id} onClick={() => navigate(`/admin/customers/${customer.id}`)}>
                    <td data-label={t("common.customer")}>
                      <div className="adm-product-cell">
                        <span className="adm-avatar adm-avatar--sm">{initials(customer.name)}</span>
                        <div>
                          <Link to={`/admin/customers/${customer.id}`} className="adm-strong">
                            {customer.name}
                          </Link>
                          <small className="adm-cell-sub">{customer.email}</small>
                        </div>
                      </div>
                    </td>
                    <td data-label={t("customers.columns.orders")} className="num">{customer.orders_count}</td>
                    <td data-label={t("customers.columns.spent")} className="num adm-mono">{money(customer.spent_cents)}</td>
                    <td data-label={t("customers.columns.lastOrder")} className="adm-muted">{customer.last_order_at ? shortDate(customer.last_order_at) : "—"}</td>
                    <td data-label={t("customers.columns.since")} className="adm-muted">{customer.created_at ? monthYear(customer.created_at) : "—"}</td>
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
