import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ProductCard } from "../components/product/ProductCard";
import { ProductGridSkeleton } from "../components/product/ProductCardSkeleton";
import { Icon } from "../components/ui/Icon";
import { Placeholder } from "../components/ui/Placeholder";
import { Reveal } from "../components/ui/Reveal";
import { compareNewCollectionOrder } from "../constants/catalog";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useWishlist } from "../context/WishlistContext";
import { useProduct, useProducts } from "../hooks/queries";
import { ApiError } from "../lib/api";
import { formatPrice } from "../utils/format";
import { NotFound } from "./NotFound";
import { catalogColour, catalogSize, catalogTag, catalogType } from "../i18n/catalog";
import { firstAvailableSize } from "../utils/product";

/**
 * Shared product gallery used temporarily across every PDP.
 * Each view is a translation key (product.views.*).
 */
const VIEW_LABELS = ["front", "back", "fullLook"] as const;

/**
 * The gallery uses the same model photos for every product, in 4 tones
 * (/model1-black.webp...). This picks the closest tone for each colour.
 */
const MODEL_PHOTO_TONE: Record<string, string> = {
  "#0a0a0a": "black",
  "#1a1818": "black",
  "#3a3a3a": "grey",
  "#3a342a": "grey",
  "#d4af37": "red",
  "#f5efe2": "white",
};

/**
 * Static accordion sections — would come from a CMS in a real app.
 * The title and text of each id live in the translations (product.accordion.*).
 */
const ACCORDION = ["details", "fit", "ship", "story"];

/**
 * Product Detail Page.
 *
 * Reads the product id from the URL. If the slug doesn't match any
 * catalogue entry, falls back to a 404 — better than rendering broken
 * data.
 */
export function Product() {
  const { t } = useTranslation("shop");
  const { id } = useParams<{ id: string }>();
  const {
    data: product,
    isPending,
    isError,
    error,
    refetch,
  } = useProduct(id);
  const { data: related = [] } = useProducts();

  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { push } = useToast();

  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [colorIdx, setColorIdx] = useState(0);
  const [openAcc, setOpenAcc] = useState<string | null>("details");

  // Reset local state whenever the user navigates to a different product.
  useEffect(() => {
    setActiveImg(0);
    setSize(null);
    setColorIdx(0);
    setOpenAcc("details");
  }, [id]);

  // A 404 from the API means the slug isn't in the catalogue — render
  // the same `NotFound` page the router uses, instead of an error card
  // that would look out of place mid-flow.
  if (isError && error instanceof ApiError && error.status === 404) {
    return <NotFound />;
  }

  if (isPending) {
    return (
      <main className="fade-in pdp">
        <div className="data-error" style={{ borderStyle: "solid", borderColor: "var(--line-2)" }}>
          <div className="title" style={{ color: "var(--gold)" }}>{t("product.loading")}</div>
          <div>{t("product.loadingSub")}</div>
        </div>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="fade-in pdp">
        <div className="data-error">
          <div className="title">{t("product.error")}</div>
          <div>{t("errors.apiDown")}</div>
          <button
            type="button"
            className="btn"
            style={{ marginTop: 16 }}
            onClick={() => refetch()}
          >
            {t("errors.retry")} <Icon.Arrow />
          </button>
          <div className="hint">{t("errors.hint")}</div>
        </div>
      </main>
    );
  }

  // The colours come from the API. Some products may have none.
  const selectedColor = product.colors[colorIdx] ?? product.colors[0];
  const colorName = selectedColor ? catalogColour(selectedColor.name) : "";
  const photoTone = (selectedColor && MODEL_PHOTO_TONE[selectedColor.hex]) || "black";
  const pdpImages = VIEW_LABELS.map((_, i) => `/model${i + 1}-${photoTone}.webp`);

  // Without a picked size we add the first one that isn't sold out.
  const defaultSize = firstAvailableSize(product);
  const isSoldOut = defaultSize === null;

  const handleAdd = () => {
    add(product, {
      size: size ?? defaultSize ?? undefined,
      colorHex: selectedColor?.hex ?? null,
    });
  };

  const handleWishlist = () => {
    toggle(product.id);
    push(has(product.id) ? t("toast.removedWishlist", { ns: "common" }) : t("toast.addedWishlist", { ns: "common" }));
  };

  return (
    <main className="fade-in pdp">
      <div className="pdp-breadcrumb">
        <Link to="/">{t("product.home")}</Link>
        <span className="sep">/</span>
        <Link to="/shop/new">{catalogType(product.cat).split("·")[0].trim()}</Link>
        <span className="sep">/</span>
        <span className="here">{product.name}</span>
      </div>

      <div className="pdp-grid">
        <div className="pdp-gallery">
          <div className="thumbs">
            {VIEW_LABELS.map((label, i) => (
              <div
                key={label}
                className={`thumb ${activeImg === i ? "active" : ""}`}
                onClick={() => setActiveImg(i)}
              >
                <Placeholder
                  palette={product.palette}
                  corner={false}
                  img={pdpImages[i]}
                />
              </div>
            ))}
          </div>
          <div className="main-img">
            <Placeholder
              label={`${product.id.toUpperCase()} ✦ ${t(`product.views.${VIEW_LABELS[activeImg]}`)}`}
              palette={
                activeImg === 0
                  ? product.palette
                  : product.palette === "gold"
                    ? "warm"
                    : "gold"
              }
              img={pdpImages[activeImg]}
            />
          </div>
        </div>

        <div className="pdp-info">
          <div className="pdp-meta">
            <span className="dot" />
            {product.tag ? catalogTag(product.tag) : t("product.defaultTag")} · {t("product.inStock")}
          </div>

          <h1 className="pdp-title">{product.name}</h1>

          <div className="pdp-price">
            <span>{formatPrice(product.price)}</span>
            {product.old && (
              <>
                <span className="old">{formatPrice(product.old)}</span>
                <span className="save">
                  {t("product.save", { percent: Math.round((1 - product.price / product.old) * 100) })}
                </span>
              </>
            )}
          </div>

          <p className="pdp-desc">{t("product.description")}</p>

          {/* `pdp-section-color` lets the stacked layout pull the swatches up
              under the gallery — tapping one has to show the photo change. */}
          {product.colors.length > 0 && (
            <div className="pdp-section pdp-section-color">
              <h4>
                <span>
                  {t("product.color")} · <span style={{ color: "var(--gold)" }}>{colorName}</span>
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-dim)" }}>
                  {t("product.colorCount", { count: product.colors.length })}
                </span>
              </h4>
              <div className="color-row">
                {product.colors.map((color, i) => (
                  <button
                    type="button"
                    key={color.hex}
                    className={`chip ${colorIdx === i ? "active" : ""}`}
                    style={{ background: color.hex }}
                    onClick={() => setColorIdx(i)}
                    title={catalogColour(color.name)}
                    aria-label={catalogColour(color.name)}
                    aria-pressed={colorIdx === i}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="pdp-section">
            <h4>
              <span>
                {t("product.size")} {size && <span style={{ color: "var(--gold)" }}>· {catalogSize(size)}</span>}
              </span>
              <span className="extra">{t("product.sizeGuide")}</span>
            </h4>
            <div className="size-row">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={size === s ? "active" : ""}
                  disabled={product.sold_out.includes(s)}
                  onClick={() => setSize(s)}
                >
                  {catalogSize(s)}
                </button>
              ))}
            </div>
            {product.sold_out.length > 0 && (
              <div className="size-note">
                {t("product.soldOut", { sizes: product.sold_out.join(", ") })}
              </div>
            )}
          </div>

          <div className="pdp-cta-row">
            <button type="button" className="btn btn-primary" onClick={handleAdd} disabled={isSoldOut}>
              {isSoldOut
                ? t("product.allSoldOut")
                : size
                  ? t("product.addToBag")
                  : t("product.addToBagDefault")}{" "}
              <Icon.Arrow />
            </button>
            <button
              type="button"
              className={`icon-btn ${has(product.id) ? "active" : ""}`}
              title={t("product.wishlist")}
              aria-pressed={has(product.id)}
              onClick={handleWishlist}
            >
              <Icon.Heart />
            </button>
          </div>

          <div className="pdp-perks">
            <div className="perk">
              <span className="lbl">{t("product.perks.shippingLabel")}</span>
              <span className="val">{t("product.perks.shippingValue")}</span>
            </div>
            <div className="perk">
              <span className="lbl">{t("product.perks.returnsLabel")}</span>
              <span className="val">{t("product.perks.returnsValue")}</span>
            </div>
            <div className="perk">
              <span className="lbl">{t("product.perks.madeInLabel")}</span>
              <span className="val">{t("product.perks.madeInValue")}</span>
            </div>
            <div className="perk">
              <span className="lbl">{t("product.perks.materialLabel")}</span>
              <span className="val">{t("product.perks.materialValue")}</span>
            </div>
          </div>

          <div className="pdp-accordion">
            {ACCORDION.map((id) => (
              <div
                key={id}
                className={`acc-item ${openAcc === id ? "open" : ""}`}
                onClick={() => setOpenAcc(openAcc === id ? null : id)}
              >
                <div className="acc-head">
                  <span>{t(`product.accordion.${id}.title`)}</span>
                  <span className="plus">
                    <Icon.Plus />
                  </span>
                </div>
                <div className="acc-body">{t(`product.accordion.${id}.body`)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="complete">
        <div className="section-head">
          <div>
            <div className="section-eyebrow">{t("product.complete.eyebrow")}</div>
            <h2 className="section-title">
              {t("product.complete.title")} <span className="gold">{t("product.complete.titleGold")}</span>
            </h2>
          </div>
          <Link to="/shop/new" className="section-link">
            {t("cta.viewAll")} <Icon.Arrow />
          </Link>
        </div>
        {related.length === 0 ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="product-grid">
            {related
              .filter((x) => x.id !== product.id)
              .sort(compareNewCollectionOrder)
              .slice(0, 4)
              .map((rp, i) => (
                <Reveal key={rp.id} delay={i * 60}>
                  <ProductCard product={rp} />
                </Reveal>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
