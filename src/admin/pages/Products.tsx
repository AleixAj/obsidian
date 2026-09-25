import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../hooks/queries";
import { mediaUrl } from "../../lib/api";
import type { ProductFilters } from "../api";
import { AdminIcon } from "../components/AdminIcon";
import { ExportButtons } from "../components/ExportButtons";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { money } from "../format";
import { useAdminProducts } from "../hooks";

type StockTab = NonNullable<ProductFilters["stock"]>;

const STOCK_TABS: { value: StockTab; label: string }[] = [
  { value: "", label: "All" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
];

/**
 * Products list: stock totals, low stock alerts, search and CSV export.
 * Warehouse users see it too, but only admins can create or edit products.
 */
export function Products() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: user } = useUser();

  const stock = (params.get("stock") ?? "") as StockTab;
  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? 1);
  const canEdit = user?.permissions.includes("products") ?? false;

  const { data, isPending, isError, isFetching } = useAdminProducts({ stock, search, page });

  /** Changes one filter in the URL and goes back to page 1. */
  function setFilter(key: "stock" | "search", value: string) {
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
        title="Products & stock"
        subtitle={data ? `${data.meta.total} ${data.meta.total === 1 ? "product" : "products"}` : undefined}
        actions={
          <>
            <ExportButtons section="products" />
            {canEdit && (
              <Link to="/admin/products/new" className="adm-btn adm-btn--gold">
                + New product
              </Link>
            )}
          </>
        }
      />

      <div className="adm-toolbar">
        <div className="adm-tabs" role="tablist" aria-label="Filter by stock">
          {STOCK_TABS.map((tab) => (
            <button
              key={tab.value || "all"}
              type="button"
              role="tab"
              aria-selected={stock === tab.value}
              className={stock === tab.value ? "is-active" : ""}
              onClick={() => setFilter("stock", tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* key={search} resets the box when the search changes from outside. */}
        <form key={search} className="adm-search adm-search--inline" onSubmit={handleSearch} role="search">
          <AdminIcon.Search />
          <input
            type="search"
            name="search"
            defaultValue={search}
            onChange={(event) => {
              if (event.target.value === "") setFilter("search", "");
            }}
            placeholder="Name or SKU"
            aria-label="Search products"
          />
        </form>
      </div>

      <div className={`adm-card adm-table-card${isFetching ? " is-loading" : ""}`}>
        {isPending && <div className="adm-loading">Loading products…</div>}
        {isError && <div className="adm-empty">Could not load the products.</div>}
        {data && data.data.length === 0 && (
          <div className="adm-empty">
            <strong>No products found</strong>
            <span>Try another filter or search.</span>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="adm-table-scroll">
            <table className="adm-table adm-table--cards">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Categories</th>
                  <th className="num">Price</th>
                  <th className="num">Stock</th>
                  <th>Alerts</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((product) => (
                  <tr key={product.id} onClick={() => navigate(`/admin/products/${product.slug}`)}>
                    <td data-label="Product">
                      <div className="adm-product-cell">
                        <img src={mediaUrl(product.img)} alt="" loading="lazy" />
                        <div>
                          <Link to={`/admin/products/${product.slug}`} className="adm-strong">
                            {product.name}
                          </Link>
                          <small className="adm-cell-sub">{product.sub_label}</small>
                        </div>
                      </div>
                    </td>
                    <td data-label="Categories" className="adm-muted">{product.categories.join(", ") || "—"}</td>
                    <td data-label="Price" className="num adm-mono">{money(product.price_cents)}</td>
                    <td data-label="Stock" className="num adm-mono">{product.total_stock ?? 0}</td>
                    <td data-label="Alerts">
                      {product.low_variants_count ? (
                        <span className="adm-stock-alert">
                          {product.low_variants_count} low {product.low_variants_count === 1 ? "variant" : "variants"}
                        </span>
                      ) : (
                        <span className="adm-muted">—</span>
                      )}
                    </td>
                    <td data-label="Status">
                      <span className={`adm-pill ${product.is_active ? "is-on" : ""}`}>
                        {product.is_active ? "Active" : "Archived"}
                      </span>
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
