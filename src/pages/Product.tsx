import { useEffect, useState } from "react";
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

/** Shared product gallery used temporarily across every PDP. */
const VIEW_LABELS = ["FRONT", "BACK", "FULL LOOK"] as const;

const MODEL_COLORS = [
  { key: "black", name: "Black", hex: "#0a0a0a" },
  { key: "grey", name: "Grey", hex: "#7b7b78" },
  { key: "red", name: "Red", hex: "#8f1f22" },
  { key: "white", name: "White", hex: "#f5efe2" },
] as const;

/** Static accordion content — would come from a CMS in a real app. */
const ACCORDION = [
  {
    id: "details",
    h: "Composition & Care",
    b: "100% organic Portuguese cotton, 580gsm. Garment-dyed and stone-washed for depth. Wash inside-out at 30°C with similar tones. Reshape and dry flat. Avoid direct sunlight when drying — the gold fades faster than you do.",
  },
  {
    id: "fit",
    h: "Fit & Sizing",
    b: "Relaxed boxy fit through the body with a dropped shoulder. Model is 184cm, wearing size M. Garment is true-to-size — size down for a closer cut. Hem sits 4cm below the natural waist on the size M.",
  },
  {
    id: "ship",
    h: "Shipping & Returns",
    b: "Free EU shipping on orders above €200. 2-3 business days with DHL Express. Free returns within 30 days — original tags must be attached. Final sale items marked at checkout.",
  },
  {
    id: "story",
    h: "The Story",
    b: "Drop 04 ✦ Aurum is our heaviest collection to date. Designed in Barcelona between February and May, sampled in Los Angeles with our partners since 2022. Limited to 200 units per piece — each tagged with its own number.",
  },
];

/**
 * Product Detail Page.
 *
 * Reads the product id from the URL. If the slug doesn't match any
 * catalogue entry, falls back to a 404 — better than rendering broken
 * data.
 */
export function Product() {
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
          <div className="title" style={{ color: "var(--gold)" }}>✦ Loading product…</div>
          <div>Fetching from the catalogue.</div>
        </div>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="fade-in pdp">
        <div className="data-error">
          <div className="title">✦ Couldn't load this product</div>
          <div>The catalogue API didn't answer.</div>
          <button
            type="button"
            className="btn"
            style={{ marginTop: 16 }}
            onClick={() => refetch()}
          >
            Retry <Icon.Arrow />
          </button>
          <div className="hint">Backend offline? `php artisan serve` on :8000</div>
        </div>
      </main>
    );
  }

  const selectedColor = MODEL_COLORS[colorIdx] ?? MODEL_COLORS[0];
  const colorName = selectedColor.name;
  const pdpImages = VIEW_LABELS.map((_, i) => `/model${i + 1}-${selectedColor.key}.webp`);

  const handleAdd = () => {
    add({
      ...product,
      size: size ?? product.sizes[0],
      colorName,
    });
  };

  const handleWishlist = () => {
    toggle(product.id);
    push(has(product.id) ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <main className="fade-in pdp">
      <div className="pdp-breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <Link to="/shop/new">{product.cat.split("·")[0].trim()}</Link>
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
              label={`${product.id.toUpperCase()} ✦ ${VIEW_LABELS[activeImg]}`}
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
            {product.tag || "FW26 ✦ Drop 04"} · In Stock
          </div>

          <h1 className="pdp-title">{product.name}</h1>

          <div className="pdp-price">
            <span>{formatPrice(product.price)}</span>
            {product.old && (
              <>
                <span className="old">{formatPrice(product.old)}</span>
                <span className="save">
                  Save {Math.round((1 - product.price / product.old) * 100)}%
                </span>
              </>
            )}
          </div>

          <p className="pdp-desc">
            Cut from 580 gsm Portuguese loopback cotton, garment-dyed for depth and faded into a
            charcoal patina. Brass eyelets, custom 24k-plated zip pull, and an inner lining
            embroidered with the Obsidian sigil. Built to outlast every winter you have left.
          </p>

          {/* `pdp-section-color` lets the stacked layout pull the swatches up
              under the gallery — tapping one has to show the photo change. */}
          <div className="pdp-section pdp-section-color">
            <h4>
              <span>
                Color · <span style={{ color: "var(--gold)" }}>{colorName}</span>
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-dim)" }}>
                {MODEL_COLORS.length} colors
              </span>
            </h4>
            <div className="color-row">
              {MODEL_COLORS.map((color, i) => (
                <span
                  key={color.key}
                  className={`chip ${colorIdx === i ? "active" : ""}`}
                  style={{ background: color.hex }}
                  onClick={() => setColorIdx(i)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="pdp-section">
            <h4>
              <span>
                Size {size && <span style={{ color: "var(--gold)" }}>· {size}</span>}
              </span>
              <span className="extra">Size guide ↗</span>
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
                  {s}
                </button>
              ))}
            </div>
            {product.sold_out.length > 0 && (
              <div className="size-note">
                {product.sold_out.join(", ")} sold out · Notify me ↗
              </div>
            )}
          </div>

          <div className="pdp-cta-row">
            <button type="button" className="btn btn-primary" onClick={handleAdd}>
              {size ? "Add to bag" : "Add to bag · default size"} <Icon.Arrow />
            </button>
            <button
              type="button"
              className={`icon-btn ${has(product.id) ? "active" : ""}`}
              title="Wishlist"
              aria-pressed={has(product.id)}
              onClick={handleWishlist}
            >
              <Icon.Heart />
            </button>
          </div>

          <div className="pdp-perks">
            <div className="perk">
              <span className="lbl">✦ Shipping</span>
              <span className="val">Free over €200 · 2-day EU</span>
            </div>
            <div className="perk">
              <span className="lbl">✦ Returns</span>
              <span className="val">30 days · No questions asked</span>
            </div>
            <div className="perk">
              <span className="lbl">✦ Made in</span>
              <span className="val">Barcelona, Spain · Hand-finished</span>
            </div>
            <div className="perk">
              <span className="lbl">✦ Material</span>
              <span className="val">580gsm Portuguese loopback</span>
            </div>
          </div>

          <div className="pdp-accordion">
            {ACCORDION.map((item) => (
              <div
                key={item.id}
                className={`acc-item ${openAcc === item.id ? "open" : ""}`}
                onClick={() => setOpenAcc(openAcc === item.id ? null : item.id)}
              >
                <div className="acc-head">
                  <span>{item.h}</span>
                  <span className="plus">
                    <Icon.Plus />
                  </span>
                </div>
                <div className="acc-body">{item.b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="complete">
        <div className="section-head">
          <div>
            <div className="section-eyebrow">Styled with ✦ Recommended</div>
            <h2 className="section-title">
              Complete <span className="gold">the look</span>
            </h2>
          </div>
          <Link to="/shop/new" className="section-link">
            View all <Icon.Arrow />
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
