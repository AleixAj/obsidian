import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useUser } from "../../hooks/queries";
import type { Product } from "../../types";
import { formatPrice } from "../../utils/format";
import { Icon } from "../ui/Icon";
import { Placeholder } from "../ui/Placeholder";
import { catalogColour, catalogTag, catalogType } from "../../i18n/catalog";
import { firstAvailableSize } from "../../utils/product";

/**
 * Compact card used across home, PLP, "complete the look" and wishlist.
 *
 * - Clicking the card opens the PDP. The name is also a real link, so
 *   keyboard users can open the product too.
 * - "Quick add" appears on hover and pushes the product into the cart
 *   with the first size that isn't sold out (so the user keeps browsing
 *   without leaving the listing).
 * - Two images swap on hover for a subtle look-shot effect.
 */
interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { add } = useCart();
  const { data: user } = useUser();
  const { has, toggle } = useWishlist();
  const isSaved = has(product.id);
  const isSoldOut = firstAvailableSize(product) === null;

  const goToProduct = () => navigate(`/product/${product.id}`);

  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    add(product);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(product.id);
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
            {catalogTag(product.tag)}
          </span>
        )}
        {user && (
          <button
            type="button"
            className={`product-wishlist-btn ${isSaved ? "active" : ""}`}
            onClick={toggleWishlist}
            aria-pressed={isSaved}
            title={isSaved ? t("productCard.removeWishlist") : t("productCard.addWishlist")}
          >
            <Icon.Heart />
          </button>
        )}
        <Placeholder
          label={`${product.id.toUpperCase()} · ${t("productCard.front")}`}
          palette={product.palette}
          className="main"
          img={product.img}
        />
        <Placeholder
          label={`${product.id.toUpperCase()} · ${t("productCard.back")}`}
          palette={product.palette === "gold" ? "warm" : "gold"}
          className="alt"
          img={product.imgAlt}
        />
        <button type="button" className="quick-add" onClick={quickAdd} disabled={isSoldOut}>
          {isSoldOut
            ? t("productCard.soldOut")
            : t("productCard.quickAdd", { price: formatPrice(product.price) })}
        </button>
      </div>
      <div className="product-info">
        <div>
          {/* stopPropagation: the card's own click would navigate a second time. */}
          <Link to={`/product/${product.id}`} className="name" onClick={(e) => e.stopPropagation()}>
            {product.name}
          </Link>
          <div className="cat">{catalogType(product.cat)}</div>
          <div className="swatches">
            {product.colors.map((c) => (
              <span key={c.hex} className="swatch" style={{ background: c.hex }} title={catalogColour(c.name)} />
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
