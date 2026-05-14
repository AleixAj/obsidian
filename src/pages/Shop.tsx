import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ProductCard } from "../components/product/ProductCard";
import { ProductGridSkeleton } from "../components/product/ProductCardSkeleton";
import { Icon } from "../components/ui/Icon";
import { Reveal } from "../components/ui/Reveal";
import { useCategories, useProducts } from "../hooks/queries";
import type { CategoryMeta } from "../lib/api";
import type { Category } from "../types";

/**
 * Fallback used when the categories endpoint hasn't responded yet or
 * the route param doesn't map to a known slug (e.g. `/shop/archive`,
 * which still isn't seeded server-side). Keeps the header rendering
 * something on-brand instead of flashing empty text.
 */
const DEFAULT_META: CategoryMeta = {
  eyebrow: "FW 26 ✦ Drop 04",
  title: "arrivals",
  goldWord: "New",
  count: 0,
};

/** Sort modes the user can pick. */
type SortMode = "featured" | "newest" | "priceAsc" | "priceDesc" | "best";
type PriceHandle = "min" | "max";

/** Color filter options shown in the sidebar. */
const COLOR_FILTERS: { hex: string; name: string }[] = [
  { hex: "#0a0a0a", name: "Obsidian" },
  { hex: "#d4af37", name: "Gold" },
  { hex: "#3a342a", name: "Tobacco" },
  { hex: "#f5efe2", name: "Bone" },
  { hex: "#5a4a2a", name: "Bronze" },
  { hex: "#1a1818", name: "Charcoal" },
];

const SIZE_FILTERS = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34"];

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "featured", label: "Sort: Featured" },
  { value: "newest", label: "Sort: Newest" },
  { value: "priceAsc", label: "Sort: Price: Low to High" },
  { value: "priceDesc", label: "Sort: Price: High to Low" },
  { value: "best", label: "Sort: Best Sellers" },
];

const PRICE_MIN = 0;
const PRICE_MAX = 890;
const NEW_COLLECTION_ORDER = [
  "p7",
  "p12",
  "p9",
  "p18",
  "p1",
  "p4",
  "p2",
  "p5",
  "p3",
  "p10",
  "p6",
  "p11",
  "p8",
  "p13",
  "p15",
  "p17",
  "p16",
  "p14",
];

/**
 * Product Listing Page.
 *
 * The category comes from the route param (`/shop/:cat`). The backend
 * narrows the catalogue server-side (`/api/products?category=`), so
 * this page only handles the in-memory refinements the sidebar offers
 * (size · colour · sort) once react-query hands it the list.
 */
export function Shop() {
  const { cat = "new" } = useParams<{ cat: Category }>();

  const {
    data: products,
    isPending: productsPending,
    isError: productsError,
    refetch: refetchProducts,
  } = useProducts(cat);
  const { data: categoryMap } = useCategories();

  const meta = categoryMap?.[cat] ?? DEFAULT_META;

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [color, setColor] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [sort, setSort] = useState<SortMode>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const priceRangeRef = useRef<HTMLDivElement>(null);
  const [minPrice, maxPrice] = priceRange;

  // Reset filters whenever the category changes so active filters from
  // one section don't bleed into another (e.g. size "28" has no matches
  // in Women after navigating from Men).
  useEffect(() => {
    setSelectedSizes([]);
    setColor(null);
    setPriceRange([PRICE_MIN, PRICE_MAX]);
  }, [cat]);

  /**
   * Derive the visible product list from the filters. Recomputed only
   * when one of the dependencies actually changes.
   *
   * The category filter is applied server-side by `useProducts(cat)`
   * for any value other than "new" (which by design contains the full
   * catalogue), so this block only handles the in-memory refinements
   * the sidebar offers (size · colour · sort).
   */
  const visible = useMemo(() => {
    let list = products ? [...products] : [];

    if (selectedSizes.length > 0) {
      list = list.filter((p) => selectedSizes.some((selectedSize) => p.sizes.includes(selectedSize)));
    }
    if (color) list = list.filter((p) => p.colors.includes(color));
    list = list.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    switch (sort) {
      case "priceAsc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.reverse();
        break;
      case "best":
        list.sort((a, b) => (b.tag ? 1 : 0) - (a.tag ? 1 : 0));
        break;
      default:
        if (cat === "new") {
          list.sort((a, b) => NEW_COLLECTION_ORDER.indexOf(a.id) - NEW_COLLECTION_ORDER.indexOf(b.id));
        }
        break;
    }

    return list;
  }, [cat, products, selectedSizes, color, minPrice, maxPrice, sort]);

  const toggleSize = (nextSize: string) => {
    setSelectedSizes((current) =>
      current.includes(nextSize)
        ? current.filter((selectedSize) => selectedSize !== nextSize)
        : [...current, nextSize],
    );
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setColor(null);
    setPriceRange([PRICE_MIN, PRICE_MAX]);
  };

  const priceStart = ((minPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const priceEnd = ((maxPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const priceFromPointer = (clientX: number) => {
    const rect = priceRangeRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const percent = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const rawPrice = PRICE_MIN + percent * (PRICE_MAX - PRICE_MIN);
    const steppedPrice = Math.round(rawPrice / 5) * 5;

    return Math.min(PRICE_MAX, Math.max(PRICE_MIN, steppedPrice));
  };

  const updatePriceFromPointer = (clientX: number, handle: PriceHandle) => {
    const nextPrice = priceFromPointer(clientX);
    if (nextPrice === null) return;

    setPriceRange(([currentMin, currentMax]) =>
      handle === "min"
        ? [Math.min(nextPrice, currentMax), currentMax]
        : [currentMin, Math.max(nextPrice, currentMin)],
    );
  };

  const startPriceDrag = (handle: PriceHandle, event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    updatePriceFromPointer(event.clientX, handle);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updatePriceFromPointer(moveEvent.clientX, handle);
    };

    const stopDragging = () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging, { once: true });
  };

  const startNearestPriceDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const nextPrice = priceFromPointer(event.clientX);
    if (nextPrice === null) return;

    const handle = Math.abs(nextPrice - minPrice) <= Math.abs(nextPrice - maxPrice) ? "min" : "max";
    startPriceDrag(handle, event);
  };

  // Header count: prefer the authoritative total from /api/categories
  // when available, otherwise fall back to whatever the products query
  // has returned (useful before categories resolve, or for slugs the
  // categories endpoint doesn't know about).
  const headerCount = meta.count || products?.length || 0;

  return (
    <main className="fade-in">
      <section className="plp-head">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="sep">/</span>
          <span>Shop</span>
          <span className="sep">/</span>
          <span className="here">{cat.toUpperCase()}</span>
        </div>
        <div className="title-row">
          <h1>
            {meta.goldWord === "The" || meta.goldWord === "Outerwear" || meta.goldWord === "Knitwear" || meta.goldWord === "Hardware" ? (
              <>
                <span className="gold">{meta.goldWord}</span> {meta.title}
              </>
            ) : (
              <>
                {meta.goldWord} <span className="gold">{meta.title}</span>
              </>
            )}
          </h1>
          <div className="summary">
            <span className="num">{headerCount}</span>
            {meta.eyebrow}
          </div>
        </div>
      </section>

      <button
        type="button"
        className="toggle-filters"
        onClick={() => setFiltersOpen((v) => !v)}
        aria-expanded={filtersOpen}
      >
        {filtersOpen ? "Hide filters" : "Show filters"} <Icon.ArrowDown />
      </button>

      <div className="plp-body">
        <aside className={`filters ${filtersOpen ? "open" : ""}`} aria-label="Filters">
          <div className="filter-group">
            <h4>
              Sort by <Icon.ArrowDown />
            </h4>
            <ul className="filter-list">
              {SORT_OPTIONS.map((opt) => (
                <li key={opt.value}>
                  <label
                    className={sort === opt.value ? "active" : ""}
                    onClick={() => setSort(opt.value)}
                  >
                    <span className="box">{sort === opt.value && "✓"}</span>
                    {opt.label.replace("Sort: ", "")}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group">
            <h4>Size</h4>
            <div className="size-chips">
              {SIZE_FILTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={selectedSizes.includes(s) ? "active" : ""}
                  onClick={() => toggleSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Color</h4>
            <div className="color-chips">
              {COLOR_FILTERS.map((c) => (
                <span
                  key={c.hex}
                  className={`color-chip ${color === c.hex ? "active" : ""}`}
                  style={{ background: c.hex }}
                  onClick={() => setColor(color === c.hex ? null : c.hex)}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Price</h4>
            <div className="price-range-label">
              €{minPrice} — €{maxPrice}
            </div>
            <div className="price-range" ref={priceRangeRef} onPointerDown={startNearestPriceDrag}>
              <div className="price-range-track" />
              <div
                className="price-range-active"
                style={{ left: `${priceStart}%`, right: `${100 - priceEnd}%` }}
              />
              <div
                className="price-range-thumb"
                role="slider"
                aria-label="Minimum price"
                aria-valuemin={PRICE_MIN}
                aria-valuemax={maxPrice}
                aria-valuenow={minPrice}
                style={{ left: `${priceStart}%` }}
                onPointerDown={(event) => startPriceDrag("min", event)}
              />
              <div
                className="price-range-thumb"
                role="slider"
                aria-label="Maximum price"
                aria-valuemin={minPrice}
                aria-valuemax={PRICE_MAX}
                aria-valuenow={maxPrice}
                style={{ left: `${priceEnd}%` }}
                onPointerDown={(event) => startPriceDrag("max", event)}
              />
            </div>
          </div>

          <button type="button" className="clear-filters" onClick={clearFilters}>
            Clear filters
          </button>
        </aside>

        <section>
          <div className="plp-toolbar">
            <div className="left">
              <span>
                {productsPending
                  ? "Loading…"
                  : `${visible.length} ${visible.length === 1 ? "result" : "results"}`}
              </span>
              {selectedSizes.map((selectedSize) => (
                <button type="button" className="chip" key={selectedSize} onClick={() => toggleSize(selectedSize)}>
                  Size: {selectedSize} ✕
                </button>
              ))}
              {(minPrice !== PRICE_MIN || maxPrice !== PRICE_MAX) && (
                <button type="button" className="chip" onClick={() => setPriceRange([PRICE_MIN, PRICE_MAX])}>
                  Price: €{minPrice} — €{maxPrice} ✕
                </button>
              )}
              {color && (
                <button type="button" className="chip" onClick={() => setColor(null)}>
                  Color ✕
                </button>
              )}
            </div>
            <div className="right">
              <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {productsPending ? (
            <ProductGridSkeleton count={6} className="plp-grid" />
          ) : productsError ? (
            <div className="data-error">
              <div className="title">✦ Couldn't load this category</div>
              <div>The catalogue API didn't answer.</div>
              <button
                type="button"
                className="btn"
                style={{ marginTop: 16 }}
                onClick={() => refetchProducts()}
              >
                Retry <Icon.Arrow />
              </button>
              <div className="hint">Backend offline? `php artisan serve` on :8000</div>
            </div>
          ) : visible.length > 0 ? (
            <div className="plp-grid">
              {visible.map((p, i) => (
                <Reveal key={p.id} delay={i * 50}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="plp-empty">
              No pieces match your filters.
              <br />
              <button
                type="button"
                onClick={clearFilters}
                style={{ color: "var(--gold)", textDecoration: "underline", marginTop: 12 }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
