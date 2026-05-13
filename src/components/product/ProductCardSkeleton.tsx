/**
 * Lightweight skeleton that mirrors `ProductCard`'s footprint.
 *
 * Renders the same layout boxes (image · name · cat · price) as plain
 * divs with a subtle shimmer so the grid doesn't reflow when real
 * cards mount. Kept dependency-free — animation lives in `pages.css`
 * under the `.product-card-skeleton` selector.
 */
export function ProductCardSkeleton() {
  return (
    <article className="product-card-skeleton" aria-hidden="true">
      <div className="sk-img" />
      <div className="sk-info">
        <div className="sk-line w-60" />
        <div className="sk-line w-40" />
        <div className="sk-line w-20" />
      </div>
    </article>
  );
}

interface ProductGridSkeletonProps {
  /** How many ghost cards to render. Defaults to 4. */
  count?: number;
  /** Optional wrapper class — defaults to the shared `.product-grid` look. */
  className?: string;
}

export function ProductGridSkeleton({
  count = 4,
  className = "product-grid",
}: ProductGridSkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
