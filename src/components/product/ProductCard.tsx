import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import type { Product } from "../../types";
import { formatPrice } from "../../utils/format";
import { Placeholder } from "../ui/Placeholder";

/**
 * Compact card used across home, PLP, "complete the look" and wishlist.
 *
 * - Clicking the card opens the PDP.
 * - "Quick add" appears on hover and pushes the product into the cart
 *   with its default size (so the user keeps browsing without leaving
 *   the listing).
 * - Two images swap on hover for a subtle look-shot effect.
 */
interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { add } = useCart();

  const goToProduct = () => navigate(`/product/${product.id}`);

  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    add(product);
  };

  return (
    <article className="product-card" onClick={goToProduct}>
      <div className="product-img">
        {product.tag && (
          <span
            className={`product-tag ${
              product.tag.startsWith("−") ? "" : product.tag === "LAST UNITS" ? "dark" : ""
            }`}
          >
            {product.tag}
          </span>
        )}
        <Placeholder
          label={`${product.id.toUpperCase()} · Front`}
          palette={product.palette}
          className="main"
          img={product.img}
        />
        <Placeholder
          label={`${product.id.toUpperCase()} · Back`}
          palette={product.palette === "gold" ? "warm" : "gold"}
          className="alt"
          img={product.imgAlt}
        />
        <button type="button" className="quick-add" onClick={quickAdd}>
          Quick add ✦ {formatPrice(product.price)}
        </button>
      </div>
      <div className="product-info">
        <div>
          <div className="name">{product.name}</div>
          <div className="cat">{product.cat}</div>
          <div className="swatches">
            {product.colors.map((c, i) => (
              <span key={i} className="swatch" style={{ background: c }} />
            ))}
          </div>
        </div>
        <div className="price">
          {product.old && <span className="old">{formatPrice(product.old)}</span>}
          {formatPrice(product.price)}
        </div>
      </div>
    </article>
  );
}
