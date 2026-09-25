import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { mediaUrl } from "../../lib/api";
import type { WarehouseLocation } from "../api";
import { errorMessage } from "../errors";
import { useAssignLocation, useRestockLocation, useUnplaced } from "../hooks";
import { fillRatio, STATE_LABELS } from "./states";

interface PanelProps {
  location: WarehouseLocation;
  onClose: () => void;
}

/**
 * Details of the selected location, with what you can do there:
 *   - restock it to full (a delivery from the supplier)
 *   - free it, or put a product in it when it's free
 */
export function LocationPanel({ location, onClose }: PanelProps) {
  const { push } = useToast();
  const restock = useRestockLocation();
  const assign = useAssignLocation();
  const isEmpty = location.variant === null;
  // The list of products without a place is only needed for a free location.
  const { data: unplaced = [] } = useUnplaced(isEmpty);
  const [variantId, setVariantId] = useState("");
  const panelRef = useRef<HTMLElement>(null);

  // On small screens the panel is under the warehouse, so we scroll down to it.
  // (The page gives this panel a new "key" for each location, so this runs every time.)
  useEffect(() => {
    if (window.innerWidth < 1100) {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const missing = location.capacity - location.stock;
  const busy = restock.isPending || assign.isPending;

  function handleRestock() {
    restock.mutate(location.id, {
      onSuccess: () => push(`${location.code} restocked with ${missing} units.`),
      onError: (error) => push(errorMessage(error, "Could not restock."), "warn"),
    });
  }

  function handleAssign(id: number | null) {
    assign.mutate(
      { id: location.id, variantId: id },
      {
        onSuccess: () => {
          setVariantId("");
          push(id ? `Product placed in ${location.code}.` : `${location.code} is free now.`);
        },
        onError: (error) => push(errorMessage(error, "Could not update the location."), "warn"),
      },
    );
  }

  return (
    <section ref={panelRef} className="adm-card wh-panel" aria-label={`Location ${location.code}`}>
      <div className="adm-card-head">
        <h2>Location</h2>
        <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close details">
          ×
        </button>
      </div>

      <div className="wh-panel-code">
        <strong className="adm-mono">{location.code}</strong>
        <span className={`wh-state is-${location.state}`}>{STATE_LABELS[location.state]}</span>
      </div>
      <p className="adm-muted adm-small">
        Aisle {location.aisle} · bay {location.bay} · level {location.level}
      </p>

      {location.variant ? (
        <>
          <div className="wh-panel-product">
            <img src={mediaUrl(location.variant.img)} alt="" />
            <div>
              <Link to={`/admin/products/${location.variant.product_slug}`} className="adm-strong">
                {location.variant.product_name}
              </Link>
              <small className="adm-cell-sub adm-mono">{location.variant.sku}</small>
              <small className="adm-cell-sub">
                <span className="adm-swatch" style={{ background: location.variant.color_hex }} /> size{" "}
                {location.variant.size_label}
              </small>
            </div>
          </div>

          <div className="wh-panel-units">
            <span>Units</span>
            <strong className="adm-mono">
              {location.stock} / {location.capacity}
            </strong>
          </div>
          <span className="wh-bar wh-bar--big">
            <span className={`is-${location.state}`} style={{ width: `${fillRatio(location) * 100}%` }} />
          </span>
          <p className="adm-muted adm-small">Alert when {location.variant.low_stock_at} units or fewer.</p>

          <div className="adm-actions">
            <button type="button" className="adm-btn adm-btn--gold" onClick={handleRestock} disabled={busy || missing <= 0}>
              {missing > 0 ? `Restock +${missing} units` : "Location is full"}
            </button>
            <button type="button" className="adm-btn" onClick={() => handleAssign(null)} disabled={busy}>
              Free this location
            </button>
          </div>
        </>
      ) : (
        <div className="adm-form">
          <p className="adm-muted">This location is free. Place a product that has no location yet:</p>
          {unplaced.length === 0 ? (
            <p className="adm-muted adm-small">Every product already has a place.</p>
          ) : (
            <>
              <select
                className="adm-input"
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                aria-label="Product to place"
              >
                <option value="">Choose a product…</option>
                {unplaced.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.product_name} · {variant.size_label} · {variant.sku}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="adm-btn adm-btn--gold"
                onClick={() => handleAssign(Number(variantId))}
                disabled={!variantId || busy}
              >
                Place here
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
