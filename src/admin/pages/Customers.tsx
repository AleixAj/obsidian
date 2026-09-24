import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { downloadCsv, type CustomerFilters } from "../api";
import { AdminIcon } from "../components/AdminIcon";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { initials, money, monthYear, shortDate } from "../format";
import { useAdminCustomers } from "../hooks";

type Sort = NonNullable<CustomerFilters["sort"]>;

const SORTS: { value: Sort; label: string }[] = [
  { value: "recent", label: "Last order" },
  { value: "spent", label: "Most spent" },
  { value: "orders", label: "Most orders" },
];

/** Customers list with search, sorting and CSV export. */
export function Customers() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [exporting, setExporting] = useState(false);

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

  async function handleExport() {
    setExporting(true);
    try {
      await downloadCsv("customers", { search, sort });
    } catch {
      push("Could not export the customers.", "warn");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle={data ? `${data.meta.total} ${data.meta.total === 1 ? "customer" : "customers"}` : undefined}
        actions={
          <button type="button" className="adm-btn" onClick={handleExport} disabled={exporting}>
            <AdminIcon.Download />
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        }
      />

      <div className="adm-toolbar">
        <div className="adm-tabs" role="tablist" aria-label="Sort customers">
          {SORTS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={sort === option.value}
              className={sort === option.value ? "is-active" : ""}
              onClick={() => setParam("sort", option.value)}
            >
              {option.label}
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
            placeholder="Name or email"
            aria-label="Search customers"
          />
        </form>
      </div>

      <div className={`adm-card adm-table-card${isFetching ? " is-loading" : ""}`}>
        {isPending && <div className="adm-loading">Loading customers…</div>}
        {isError && <div className="adm-empty">Could not load the customers.</div>}
        {data && data.data.length === 0 && (
          <div className="adm-empty">
            <strong>No customers found</strong>
            <span>Try another search.</span>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="adm-table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th className="num">Orders</th>
                  <th className="num">Spent</th>
                  <th>Last order</th>
                  <th>Customer since</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((customer) => (
                  <tr key={customer.id} onClick={() => navigate(`/admin/customers/${customer.id}`)}>
                    <td>
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
                    <td className="num">{customer.orders_count}</td>
                    <td className="num adm-mono">{money(customer.spent_cents)}</td>
                    <td className="adm-muted">{customer.last_order_at ? shortDate(customer.last_order_at) : "—"}</td>
                    <td className="adm-muted">{customer.created_at ? monthYear(customer.created_at) : "—"}</td>
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
