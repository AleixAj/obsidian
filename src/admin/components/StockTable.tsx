import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";
import type { AdminProduct } from "../api";
import { errorMessage } from "../errors";
import { dateTime } from "../format";
import { useUpdateStock } from "../hooks";

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

  // Units typed by the user, by variant id. Starts with the saved values.
  const [stock, setStock] = useState<Record<number, string>>(() =>
    Object.fromEntries(variants.map((variant) => [variant.id, String(variant.stock)])),
  );
  // One alert level for the whole product keeps the form simple.
  const [lowAt, setLowAt] = useState(String(variants[0]?.low_stock_at ?? 5));
  const [note, setNote] = useState("");

  const findVariant = (hex: string, size: string) =>
    variants.find((variant) => variant.color_hex === hex && variant.size_label === size);

  const total = variants.reduce((sum, variant) => sum + (Number(stock[variant.id]) || 0), 0);
  const hasChanges =
    variants.some((variant) => Number(stock[variant.id]) !== variant.stock) ||
    Number(lowAt) !== (variants[0]?.low_stock_at ?? 5);

  function handleSave() {
    updateStock.mutate(
      {
        variants: variants.map((variant) => ({
          id: variant.id,
          stock: Math.max(0, Math.floor(Number(stock[variant.id]) || 0)),
          low_stock_at: Math.max(0, Math.floor(Number(lowAt) || 0)),
        })),
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          setNote("");
          push(t("stock.saved"));
        },
        onError: (error) => push(errorMessage(error, t("stock.saveError")), "warn"),
      },
    );
  }

  return (
    <div className="adm-detail">
      <section className="adm-card adm-detail-main">
        <div className="adm-card-head">
          <h2>{t("stock.title", { units: total })}</h2>
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
                    <span className="adm-swatch" style={{ background: color.hex }} /> {color.name ?? color.hex}
                  </td>
                  {sizes.map((size) => {
                    const variant = findVariant(color.hex, size);
                    if (!variant) return <td key={size} className="adm-center adm-muted">—</td>;

                    const units = Number(stock[variant.id]) || 0;
                    const tone = units === 0 ? "is-out" : units <= Number(lowAt) ? "is-low" : "";

                    return (
                      <td key={size} className="adm-center">
                        <input
                          className={`adm-input adm-stock-input ${tone}`}
                          type="number"
                          min="0"
                          value={stock[variant.id] ?? ""}
                          onChange={(e) => setStock({ ...stock, [variant.id]: e.target.value })}
                          aria-label={t("stock.inputLabel", { colour: color.name ?? color.hex, size })}
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
            <input className="adm-input adm-stock-input" type="number" min="0" value={lowAt} onChange={(e) => setLowAt(e.target.value)} />
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
          <button type="button" className="adm-btn adm-btn--gold" onClick={handleSave} disabled={!hasChanges || updateStock.isPending}>
            {updateStock.isPending ? t("common.saving") : t("stock.save")}
          </button>
        </div>
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
                <span className="adm-mono">{movement.sku}</span>
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
