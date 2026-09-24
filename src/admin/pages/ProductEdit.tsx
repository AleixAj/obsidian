import { useQuery } from "@tanstack/react-query";
import { useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useUser } from "../../hooks/queries";
import { fetchCategories, mediaUrl } from "../../lib/api";
import { PRODUCT_IMAGE_MAX_MB, uploadProductImage, type AdminProduct, type ProductPayload } from "../api";
import { AdminIcon } from "../components/AdminIcon";
import { StockTable } from "../components/StockTable";
import { errorMessage } from "../errors";
import { useAdminProduct, useSaveProduct } from "../hooks";

/**
 * Create a product (/admin/products/new) or edit one (/admin/products/:slug).
 *
 * Only admins can change the details. Warehouse users see them read-only
 * and can only change the stock (the StockTable at the bottom).
 */
export function ProductEdit() {
  const { slug } = useParams();
  const { data: product, isPending, isError } = useAdminProduct(slug);

  if (slug && isPending) return <div className="adm-loading">Loading product…</div>;
  if (slug && (isError || !product)) {
    return (
      <div className="adm-empty">
        <strong>Product not found</strong>
        <Link to="/admin/products" className="adm-link">
          Back to products
        </Link>
      </div>
    );
  }

  // key: when we move to another product, the form starts again with its values.
  return <ProductForm key={product?.slug ?? "new"} product={product} />;
}

/** Form values. Prices are text in euros ("129.90") while the user types. */
interface FormValues {
  name: string;
  sub_label: string;
  price: string;
  old_price: string;
  tag: string;
  img: string;
  img_alt: string;
  is_active: boolean;
  categories: string[];
  colors: { hex: string; name: string }[];
  sizes: string[];
}

function toFormValues(product?: AdminProduct): FormValues {
  return {
    name: product?.name ?? "",
    sub_label: product?.sub_label ?? "",
    price: product ? (product.price_cents / 100).toFixed(2) : "",
    old_price: product?.old_price_cents ? (product.old_price_cents / 100).toFixed(2) : "",
    tag: product?.tag ?? "",
    img: product?.img ?? "",
    img_alt: product?.img_alt ?? "",
    is_active: product?.is_active ?? true,
    categories: product?.categories ?? [],
    colors: product?.colors?.map((color) => ({ hex: color.hex, name: color.name ?? "" })) ?? [
      { hex: "#0a0a0a", name: "Onyx" },
    ],
    sizes: product?.sizes ?? ["S", "M", "L", "XL"],
  };
}

/** "129.90" → 12990. Empty text → null. */
function toCents(value: string): number | null {
  if (value.trim() === "") return null;
  return Math.round(Number(value.replace(",", ".")) * 100);
}

function ProductForm({ product }: { product?: AdminProduct }) {
  const navigate = useNavigate();
  const { push } = useToast();
  const { data: user } = useUser();
  const canEdit = user?.permissions.includes("products") ?? false;

  const [values, setValues] = useState<FormValues>(() => toFormValues(product));
  const [newSize, setNewSize] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"img" | "img_alt" | null>(null);
  const save = useSaveProduct(product?.slug);
  // Demo accounts are shared by everyone, so they can't upload files.
  const canUpload = canEdit && !user?.is_demo;
  const { data: categories = [] } = useQuery({ queryKey: ["categories", "list"], queryFn: fetchCategories });

  /** Updates one field of the form. */
  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function toggleCategory(slug: string) {
    set(
      "categories",
      values.categories.includes(slug)
        ? values.categories.filter((c) => c !== slug)
        : [...values.categories, slug],
    );
  }

  function updateColor(index: number, field: "hex" | "name", value: string) {
    set(
      "colors",
      values.colors.map((color, i) => (i === index ? { ...color, [field]: value } : color)),
    );
  }

  function addSize() {
    const label = newSize.trim().toUpperCase();
    if (label && !values.sizes.includes(label)) set("sizes", [...values.sizes, label]);
    setNewSize("");
  }

  function handleSizeKey(event: KeyboardEvent<HTMLInputElement>) {
    // Enter adds the size instead of sending the whole form.
    if (event.key === "Enter") {
      event.preventDefault();
      addSize();
    }
  }

  /** Uploads the chosen photo and puts its URL in the image field. */
  async function handleImage(field: "img" | "img_alt", event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > PRODUCT_IMAGE_MAX_MB * 1024 * 1024) {
      setError(`The image is too big. The limit is ${PRODUCT_IMAGE_MAX_MB} MB.`);
      return;
    }

    setError(null);
    setUploading(field);
    try {
      set(field, await uploadProductImage(file));
    } catch (err) {
      setError(errorMessage(err, "Could not upload the image."));
    } finally {
      setUploading(null);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const payload: ProductPayload = {
      name: values.name.trim(),
      sub_label: values.sub_label.trim() || null,
      price_cents: toCents(values.price) ?? 0,
      old_price_cents: toCents(values.old_price),
      tag: values.tag.trim() || null,
      img: values.img.trim(),
      img_alt: values.img_alt.trim() || null,
      is_active: values.is_active,
      categories: values.categories,
      colors: values.colors.map((color) => ({ hex: color.hex, name: color.name.trim() || null })),
      sizes: values.sizes,
    };

    save.mutate(payload, {
      onSuccess: (saved) => {
        push(product ? "Product saved." : "Product created. Now add its stock.");
        // After creating, go to its page so the stock can be filled in.
        if (!product) navigate(`/admin/products/${saved.slug}`, { replace: true });
      },
      onError: (err) => setError(errorMessage(err, "Could not save the product.")),
    });
  }

  return (
    <>
      <Link to="/admin/products" className="adm-back">
        <AdminIcon.ArrowLeft /> Products
      </Link>

      <header className="adm-page-header">
        <div>
          <h1>{product ? product.name : "New product"}</h1>
          {product && (
            <p>
              <a href={`/product/${product.slug}`} target="_blank" rel="noreferrer" className="adm-link">
                View in store ↗
              </a>
            </p>
          )}
        </div>
      </header>

      {!canEdit && (
        <div className="adm-note">Your role can change the stock, but not the product details.</div>
      )}

      <form className="adm-detail" onSubmit={handleSubmit}>
        {/* disabled on a fieldset disables every input inside it. */}
        <fieldset className="adm-detail-main adm-fieldset" disabled={!canEdit}>
          <section className="adm-card adm-form">
            <div className="adm-card-head">
              <h2>Details</h2>
            </div>
            <label>
              Name
              <input className="adm-input" value={values.name} onChange={(e) => set("name", e.target.value)} required maxLength={120} />
            </label>
            <label>
              Subtitle <small>e.g. "Hoodie · Urban Man"</small>
              <input className="adm-input" value={values.sub_label} onChange={(e) => set("sub_label", e.target.value)} maxLength={120} />
            </label>
            <div className="adm-form-row">
              <label>
                Price (€)
                <input
                  className="adm-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.price}
                  onChange={(e) => set("price", e.target.value)}
                  required
                />
              </label>
              <label>
                Price before sale (€) <small>optional</small>
                <input
                  className="adm-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.old_price}
                  onChange={(e) => set("old_price", e.target.value)}
                />
              </label>
              <label>
                Tag <small>e.g. NEW</small>
                <input className="adm-input" value={values.tag} onChange={(e) => set("tag", e.target.value)} maxLength={30} />
              </label>
            </div>

            <div className="adm-field">
              <span>Categories</span>
              <div className="adm-checks">
                {categories.map((category) => (
                  <label key={category.slug} className="adm-check">
                    <input
                      type="checkbox"
                      checked={values.categories.includes(category.slug)}
                      onChange={() => toggleCategory(category.slug)}
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>

            <label className="adm-check">
              <input type="checkbox" checked={values.is_active} onChange={(e) => set("is_active", e.target.checked)} />
              Visible in the store <small>(uncheck to archive it)</small>
            </label>
          </section>

          <section className="adm-card adm-form">
            <div className="adm-card-head">
              <h2>Colours & sizes</h2>
            </div>
            <div className="adm-field">
              <span>Colours</span>
              {values.colors.map((color, index) => (
                <div key={index} className="adm-color-row">
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => updateColor(index, "hex", e.target.value)}
                    aria-label="Colour"
                  />
                  <input className="adm-input adm-mono" value={color.hex} onChange={(e) => updateColor(index, "hex", e.target.value)} aria-label="Hex code" />
                  <input
                    className="adm-input"
                    value={color.name}
                    onChange={(e) => updateColor(index, "name", e.target.value)}
                    placeholder="Name, e.g. Onyx"
                    aria-label="Colour name"
                  />
                  <button
                    type="button"
                    className="adm-icon-btn"
                    onClick={() => set("colors", values.colors.filter((_, i) => i !== index))}
                    disabled={values.colors.length === 1}
                    aria-label="Remove colour"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" className="adm-btn" onClick={() => set("colors", [...values.colors, { hex: "#3a3a3a", name: "" }])}>
                + Add colour
              </button>
            </div>

            <div className="adm-field">
              <span>Sizes</span>
              <div className="adm-chips">
                {values.sizes.map((size) => (
                  <span key={size} className="adm-chip">
                    {size}
                    <button
                      type="button"
                      onClick={() => set("sizes", values.sizes.filter((s) => s !== size))}
                      disabled={values.sizes.length === 1}
                      aria-label={`Remove size ${size}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  className="adm-input adm-chip-input"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyDown={handleSizeKey}
                  onBlur={addSize}
                  placeholder="+ size"
                  maxLength={10}
                  aria-label="New size"
                />
              </div>
            </div>
            {product && (
              <p className="adm-muted adm-small">
                Adding a colour or size creates its variants with 0 units. Removing one deletes its stock.
              </p>
            )}
          </section>
        </fieldset>

        <aside className="adm-detail-side">
          <section className="adm-card adm-form">
            <div className="adm-card-head">
              <h2>Images</h2>
            </div>
            {values.img && <img className="adm-preview" src={mediaUrl(values.img)} alt="" />}
            <fieldset className="adm-fieldset adm-form" disabled={!canEdit}>
              {(["img", "img_alt"] as const).map((field) => (
                <div key={field} className="adm-field">
                  <label>
                    {field === "img" ? "Main image" : "Hover image"}{" "}
                    <small>{field === "img" ? "upload a photo or paste a link" : "optional"}</small>
                    <input
                      className="adm-input"
                      value={values[field]}
                      onChange={(e) => set(field, e.target.value)}
                      placeholder="https://…"
                      required={field === "img"}
                    />
                  </label>
                  {canUpload && (
                    <label className="adm-btn adm-upload-btn">
                      {uploading === field ? "Uploading…" : "Upload from computer"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        hidden
                        disabled={uploading !== null}
                        onChange={(e) => handleImage(field, e)}
                      />
                    </label>
                  )}
                </div>
              ))}
              <p className="adm-muted adm-small">
                {canUpload
                  ? `JPG, PNG or WebP, at least 400 px, up to ${PRODUCT_IMAGE_MAX_MB} MB.`
                  : canEdit
                    ? "Photo uploads are turned off for the demo accounts. You can paste a link."
                    : null}
              </p>
            </fieldset>
          </section>

          {canEdit && (
            <section className="adm-card">
              {error && <div className="adm-alert">{error}</div>}
              <button type="submit" className="adm-btn adm-btn--gold adm-btn--full" disabled={save.isPending}>
                {save.isPending ? "Saving…" : product ? "Save changes" : "Create product"}
              </button>
            </section>
          )}
        </aside>
      </form>

      {/* key: if colours or sizes change, the grid starts again with the new variants. */}
      {product?.variants && <StockTable key={product.variants.map((v) => v.id).join("-")} product={product} />}
    </>
  );
}
