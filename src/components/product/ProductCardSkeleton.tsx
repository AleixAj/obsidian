/**
 * A grey "loading" card with the same size as ProductCard, so the grid
 * doesn't jump when the real cards arrive. The shine animation is in
 * pages.css (.product-card-skeleton).
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
  /** How many loading cards to show. 4 by default. */
  count?: number;
  /** Class of the grid around them. "product-grid" by default. */
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
