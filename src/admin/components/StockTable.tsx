import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";
import { catalogColour } from "../../i18n/catalog";
import { ApiError } from "../../lib/api";
import type { AdminProduct, ProductVariant } from "../api";
import { errorMessage } from "../errors";
import { dateTime } from "../format";
import { useAdminProduct, useUpdateStock } from "../hooks";

/** True for "0", "12"... and false for "", "-5", "3.7" or "abc". */
function isWholeNumber(text: string): boolean {
  return /^\d+$/.test(text.trim());
}

/** Units of each variant, as text for the inputs: { 12: "4", 13: "0" }. */
function stockInputs(variants: ProductVariant[]): Record<number, string> {
  return Object.fromEntries(variants.map((variant) => [variant.id, String(variant.stock)]));
}

/** The alert level if every variant has the same one, or "" if they are different. */
function sharedAlert(variants: ProductVariant[]): string {
  const levels = new Set(variants.map((variant) => variant.low_stock_at));
  return levels.size === 1 ? String(variants[0].low_stock_at) : "";
}

/**
 * Stock grid of one product: a row per colour, a column per size.
 * Admin and warehouse can type the new numbers and save them all at once.
 * Below it, the last stock movements (sales, adjustments...).
 */
export function StockTable({ product }: { product: AdminProduct }) {
  const variants = product.variants ?? [];
  const colors = product.colors ?? [];
  const sizes = product.sizes ?? [];
  const { t } = useTranslation("admin");
  const { push } = useToast();
  const updateStock = useUpdateStock(product.slug);
  const { refetch } = useAdminProduct(product.slug);

  // Units typed by the user, by variant id. Starts with the saved values.
  const [stock, setStock] = useState(() => stockInputs(variants));
  // One alert level for the whole product keeps the form simple.
  // It's only sent if the user changes it; otherwise each variant keeps its own.
  const [lowAt, setLowAt] = useState(() => sharedAlert(variants));
  const [note, setNote] = useState("");

  const findVariant = (hex: string, size: string) =>
    variants.find((variant) => variant.color_hex === hex && variant.size_label === size);

  /** Puts the inputs back to the numbers saved on the server. */
  function resetInputs(saved: ProductVariant[]) {
    setStock(stockInputs(saved));
    setLowAt(sharedAlert(saved));
  }

  const changedVariants = variants.filter((variant) => stock[variant.id] !== String(variant.stock));
  const alertChanged = lowAt !== sharedAlert(variants);
  const hasChanges = changedVariants.length > 0 || alertChanged;
  const isValid = variants.every((variant) => isWholeNumber(stock[variant.id] ?? "")) && (!alertChanged || isWholeNumber(lowAt));
  const total = variants.reduce((sum, variant) => sum + (Number(stock[variant.id]) || 0), 0);

  function handleSave() {
    // A new alert level goes to every variant. If not, only the changed ones are sent.
    const toSend = alertChanged ? variants : changedVariants;

    updateStock.mutate(
      {
        variants: toSend.map((variant) => ({
          id: variant.id,
          stock: Number(stock[variant.id]),
          // The number we loaded. If someone changed it meanwhile, the API answers 409.
          expected_stock: variant.stock,
          low_stock_at: alertChanged ? Number(lowAt) : undefined,
        })),
        note: note.trim() || undefined,
      },
      {
        onSuccess: (saved) => {
          resetInputs(saved.variants ?? []);
          setNote("");
          push(t("stock.saved"));
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            // Someone else changed the stock: load the new numbers.
            push(errorMessage(error, t("stock.conflict")), "warn");
            refetch().then((result) => {
              if (result.data?.variants) resetInputs(result.data.variants);
            });
            return;
          }
          push(errorMessage(error, t("stock.saveError")), "warn");
        },
      },
    );
  }

  return (
    <div className="adm-detail">
      <section className="adm-card adm-detail-main">
        <div className="adm-card-head">
          <h2>{t("stock.title", { count: total })}</h2>
        </div>

        <div className="adm-table-scroll">
          <table className="adm-table adm-table--plain adm-stock-grid">
            <thead>
              <tr>
                <th>{t("common.colour")}</th>
                {sizes.map((size) => (
                  <th key={size} className="adm-center">
                    {size}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {colors.map((color) => (
                <tr key={color.hex}>
                  <td>
                    <span className="adm-swatch" style={{ background: color.hex }} /> {color.name ? catalogColour(color.name) : color.hex}
                  </td>
                  {sizes.map((size) => {
                    const variant = findVariant(color.hex, size);
                    if (!variant) return <td key={size} className="adm-center adm-muted">—</td>;

                    const units = Number(stock[variant.id]) || 0;
                    // The new alert level if the user typed one, or the variant's own.
                    const alert = alertChanged && isWholeNumber(lowAt) ? Number(lowAt) : variant.low_stock_at;
                    const tone = units === 0 ? "is-out" : units <= alert ? "is-low" : "";

                    return (
                      <td key={size} className="adm-center">
                        <input
                          className={`adm-input adm-stock-input ${tone}`}
                          type="number"
                          min="0"
                          step="1"
                          value={stock[variant.id] ?? ""}
                          aria-invalid={!isWholeNumber(stock[variant.id] ?? "")}
                          onChange={(e) => setStock({ ...stock, [variant.id]: e.target.value })}
                          aria-label={t("stock.inputLabel", { colour: color.name ? catalogColour(color.name) : color.hex, size })}
                          title={variant.sku}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm-stock-footer">
          <label>
            {t("stock.alertAt")}
            <input
              className="adm-input adm-stock-input"
              type="number"
              min="0"
              step="1"
              value={lowAt}
              // When the variants have different levels, the box starts empty.
              placeholder={t("stock.alertMixed")}
              onChange={(e) => setLowAt(e.target.value)}
              aria-invalid={alertChanged && !isWholeNumber(lowAt)}
            />
          </label>
          <label>
            <span className="adm-label-row">
              {t("common.note")} <small>{t("common.optional")}</small>
            </span>
            <input
              className="adm-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("stock.notePlaceholder")}
              maxLength={255}
            />
          </label>
          <button type="button" className="adm-btn adm-btn--gold" onClick={handleSave} disabled={!hasChanges || !isValid || updateStock.isPending}>
            {updateStock.isPending ? t("common.saving") : t("stock.save")}
          </button>
        </div>
        {!isValid && <p className="adm-alert">{t("stock.invalid")}</p>}
        <p className="adm-muted adm-small">
          <span className="adm-legend-dot is-low" /> {t("stock.legendLow")} <span className="adm-legend-dot is-out" />{" "}
          {t("stock.legendOut")}
        </p>
      </section>

      <aside className="adm-card adm-detail-side">
        <div className="adm-card-head">
          <h2>{t("stock.history")}</h2>
        </div>
        {(product.recent_movements ?? []).length === 0 && <p className="adm-muted">{t("stock.noHistory")}</p>}
        <ul className="adm-movements">
          {product.recent_movements?.map((movement) => (
            <li key={movement.id}>
              <div>
                <strong className={movement.change > 0 ? "is-up" : "is-down"}>
                  {movement.change > 0 ? "+" : ""}
                  {movement.change}
                </strong>{" "}
                {/* sku is null when the variant was deleted later. */}
                <span className="adm-mono">{movement.sku ?? "—"}</span>
              </div>
              <small className="adm-muted">
                {/* Unknown reasons show the code as it comes from the API. */}
                {t(`stock.reasons.${movement.reason}`, { defaultValue: movement.reason })} · {movement.by} · {dateTime(movement.at)}
              </small>
              {movement.note && <em>“{movement.note}”</em>}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
