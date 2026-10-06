import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { Placeholder } from "../../components/ui/Placeholder";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { catalogType } from "../../i18n/catalog";
import { formatPrice } from "../../utils/format";
import { sizedImage } from "../../utils/image";
import { firstAvailableSize } from "../../utils/product";
import type { ProductMap } from "./helpers";

/** The saved products, with "add to bag" and "remove" buttons. */

export function WishlistView({ productMap }: { productMap: ProductMap }) {
  const { t } = useTranslation("account");
  const navigate = useNavigate();
  const { ids, remove } = useWishlist();
  const { add } = useCart();

  if (ids.length === 0) {
    return (
      <>
        <div className="account-hello">
          <div>
            <div className="eyebrow">
              <span className="dot" />
              {t("wishlist.eyebrowEmpty")}
            </div>
            <h1>
              {t("wishlist.title1")}
            <span className="gold">{t("wishlist.title2")}</span>
            </h1>
          </div>
        </div>
        <div className="empty-state">
          <div className="icon">
            <Icon.Heart />
          </div>
          <h4>{t("wishlist.empty.title")}</h4>
          <p>{t("wishlist.empty.text")}</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/shop/new")}>
            {t("wishlist.empty.cta")} <Icon.Arrow />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="account-hello">
        <div>
          <div className="eyebrow">
            <span className="dot" />
            {t("wishlist.eyebrow", { n: ids.length })}
          </div>
          <h1>
            {t("wishlist.title1")}
            <span className="gold">{t("wishlist.title2")}</span>
          </h1>
        </div>
      </div>

      <div className="wishlist-grid">
        {ids.map((id) => {
          const product = productMap.get(id);
          if (!product) return null;
          return (
            <article key={product.id} className="wish-card">
              <div className="img" onClick={() => navigate(`/product/${product.id}`)}>
                <button
                  type="button"
                  className="heart-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(product.id);
                  }}
                  title={t("wishlist.removeFromWishlist")}
                >
                  <Icon.Heart />
                </button>
                <Placeholder
                  palette={product.palette}
                  corner
                  img={sizedImage(product.img, 600)}
                  label={product.id.toUpperCase()}
                />
              </div>
              <div className="info">
                <div
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="name">{product.name}</div>
                  <div className="cat">
                    {catalogType(product.cat)} · {formatPrice(product.price)}
                  </div>
                </div>
                <div className="actions">
                  {firstAvailableSize(product) ? (
                    <button type="button" className="btn-add" onClick={() => add(product)}>
                      {t("wishlist.addToBag", { price: formatPrice(product.price) })}
                    </button>
                  ) : (
                    <button type="button" className="btn-add" disabled>
                      {t("wishlist.soldOut")}
                    </button>
                  )}
                  <button
                    type="button"
                    className="remove"
                    onClick={() => remove(product.id)}
                    title={t("wishlist.remove")}
                  >
                    <Icon.Close />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
