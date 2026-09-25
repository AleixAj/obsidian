import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../hooks/queries";
import { catalogCategory, catalogType } from "../../i18n/catalog";
import { mediaUrl } from "../../lib/api";
import type { ProductFilters } from "../api";
import { AdminIcon } from "../components/AdminIcon";
import { ExportButtons } from "../components/ExportButtons";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { money } from "../format";
import { useAdminProducts } from "../hooks";
import { openRow, pageFromUrl } from "../tables";

type StockTab = NonNullable<ProductFilters["stock"]>;

// "label" is a translation key (admin.json).
const STOCK_TABS: { value: StockTab; label: string }[] = [
  { value: "", label: "common.all" },
  { value: "low", label: "products.tabs.low" },
  { value: "out", label: "products.tabs.out" },
];

/**
 * Products list: stock totals, low stock alerts, search and CSV export.
 * Warehouse users see it too, but only admins can create or edit products.
 */
export function Products() {
  const { t } = useTranslation("admin");
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: user } = useUser();

  const stock = (params.get("stock") ?? "") as StockTab;
  const search = params.get("search") ?? "";
  const page = pageFromUrl(params);
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
        title={t("products.title")}
        subtitle={data ? t("products.count", { count: data.meta.total }) : undefined}
        actions={
          <>
            <ExportButtons section="products" />
            {canEdit && (
              <Link to="/admin/products/new" className="adm-btn adm-btn--gold">
                {t("products.newProduct")}
              </Link>
            )}
          </>
        }
      />

      <div className="adm-toolbar">
        <div className="adm-tabs" role="tablist" aria-label={t("products.filterByStock")}>
          {STOCK_TABS.map((tab) => (
            <button
              key={tab.value || "all"}
              type="button"
              role="tab"
              aria-selected={stock === tab.value}
              className={stock === tab.value ? "is-active" : ""}
              onClick={() => setFilter("stock", tab.value)}
            >
              {t(tab.label)}
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
            placeholder={t("products.searchPlaceholder")}
            aria-label={t("products.searchLabel")}
          />
        </form>
      </div>

      <div className={`adm-card adm-table-card${isFetching ? " is-loading" : ""}`}>
        {isPending && <div className="adm-loading">{t("products.loading")}</div>}
        {isError && <div className="adm-empty">{t("products.loadError")}</div>}
        {data && data.data.length === 0 && (
          <div className="adm-empty">
            <strong>{t("products.empty")}</strong>
            <span>{t("products.emptyHint")}</span>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="adm-table-scroll">
            <table className="adm-table adm-table--cards">
              <thead>
                <tr>
                  <th>{t("common.product")}</th>
                  <th>{t("products.columns.categories")}</th>
                  <th className="num">{t("common.price")}</th>
                  <th className="num">{t("products.columns.stock")}</th>
                  <th>{t("products.columns.alerts")}</th>
                  <th>{t("common.status")}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((product) => (
                  <tr key={product.id} onClick={openRow(() => navigate(`/admin/products/${product.slug}`))}>
                    <td data-label={t("common.product")}>
                      <div className="adm-product-cell">
                        <img src={mediaUrl(product.img)} alt="" loading="lazy" />
                        <div>
                          <Link to={`/admin/products/${product.slug}`} className="adm-strong">
                            {product.name}
                          </Link>
                          <small className="adm-cell-sub">{product.sub_label && catalogType(product.sub_label)}</small>
                        </div>
                      </div>
                    </td>
                    <td data-label={t("products.columns.categories")} className="adm-muted">{product.categories.map(catalogCategory).join(", ") || "—"}</td>
                    <td data-label={t("common.price")} className="num adm-mono">{money(product.price_cents)}</td>
                    <td data-label={t("products.columns.stock")} className="num adm-mono">{product.total_stock ?? 0}</td>
                    <td data-label={t("products.columns.alerts")}>
                      {product.low_variants_count ? (
                        <span className="adm-stock-alert">
                          {t("products.lowVariants", { count: product.low_variants_count })}
                        </span>
                      ) : (
                        <span className="adm-muted">—</span>
                      )}
                    </td>
                    <td data-label={t("common.status")}>
                      <span className={`adm-pill ${product.is_active ? "is-on" : ""}`}>
                        {product.is_active ? t("products.active") : t("products.archived")}
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
