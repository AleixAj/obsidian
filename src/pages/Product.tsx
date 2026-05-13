import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProductCard } from "../components/product/ProductCard";
import { Icon } from "../components/ui/Icon";
import { Placeholder } from "../components/ui/Placeholder";
import { Reveal } from "../components/ui/Reveal";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useWishlist } from "../context/WishlistContext";
import { PRODUCTS } from "../data/products";
import { formatPrice } from "../utils/format";
import { NotFound } from "./NotFound";

/** Gallery thumbnails — alternates between primary and alt photo. */
const VIEW_LABELS = ["FRONT", "BACK", "DETAIL", "ON BODY"] as const;

/** Friendly names matched index-for-index against `product.colors`. */
const COLOR_NAMES = ["Obsidian", "Gold Cast", "Tobacco", "Bone", "Bronze"];

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
  const product = useMemo(() => PRODUCTS.find((p) => p.id === id) ?? null, [id]);

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

  if (!product) return <NotFound />;

  const colorName = COLOR_NAMES[colorIdx] ?? "Obsidian";

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
                  img={i % 2 === 0 ? product.img : product.imgAlt}
                />
              </div>
            ))}
          </div>
          <div className="main-img">
            <span className="zoom">
              <Icon.Zoom /> Zoom ✦ Drag
            </span>
            <Placeholder
              label={`${product.id.toUpperCase()} ✦ ${VIEW_LABELS[activeImg]}`}
              palette={
                activeImg % 2 === 0
                  ? product.palette
                  : product.palette === "gold"
                    ? "warm"
                    : "gold"
              }
              img={activeImg % 2 === 0 ? product.img : product.imgAlt}
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

          <div className="pdp-section">
            <h4>
              <span>
                Color · <span style={{ color: "var(--gold)" }}>{colorName}</span>
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-dim)" }}>
                {product.colors.length} colors
              </span>
            </h4>
            <div className="color-row">
              {product.colors.map((c, i) => (
                <span
                  key={i}
                  className={`chip ${colorIdx === i ? "active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setColorIdx(i)}
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
        <div className="product-grid">
          {PRODUCTS.filter((x) => x.id !== product.id)
            .slice(0, 4)
            .map((rp, i) => (
              <Reveal key={rp.id} delay={i * 60}>
                <ProductCard product={rp} />
              </Reveal>
            ))}
        </div>
      </section>
    </main>
  );
}
