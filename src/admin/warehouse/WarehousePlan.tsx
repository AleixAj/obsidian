import { useTranslation } from "react-i18next";
import type { Warehouse, WarehouseLocation } from "../api";
import { STATE_LABELS } from "./states";

interface PlanProps {
  warehouse: Warehouse;
  selectedId: number | null;
  onSelect: (location: WarehouseLocation) => void;
  isMatch: (location: WarehouseLocation) => boolean;
}

/**
 * The warehouse seen from above, like a floor plan.
 * One column per aisle, one row per bay, and a small square for each level
 * (1 = floor, on the left). It works on phones and without 3D.
 */
export function WarehousePlan({ warehouse, selectedId, onSelect, isMatch }: PlanProps) {
  const { t } = useTranslation("admin");
  const { aisles, bays, levels } = warehouse.layout;

  // Quick lookup: "B-4-2" → location, so we don't search the list every time.
  const byPosition = new Map(warehouse.locations.map((l) => [`${l.aisle}-${l.bay}-${l.level}`, l]));

  return (
    <div className="wh-plan">
      {aisles.map((aisle) => (
        <section key={aisle} className="wh-plan-aisle" aria-label={t("warehouse.aisle", { aisle })}>
          <h3>{t("warehouse.aisle", { aisle })}</h3>
          {Array.from({ length: bays }, (_, b) => {
            const bay = b + 1;
            return (
              <div key={bay} className="wh-plan-bay">
                <span className="wh-plan-bay-number">{String(bay).padStart(2, "0")}</span>
                {Array.from({ length: levels }, (_, l) => {
                  const location = byPosition.get(`${aisle}-${bay}-${l + 1}`);
                  if (!location) return <span key={l} className="wh-cell is-missing" />;

                  return (
                    <button
                      key={location.id}
                      type="button"
                      className={[
                        "wh-cell",
                        `is-${location.state}`,
                        location.id === selectedId ? "is-selected" : "",
                        isMatch(location) ? "" : "is-faded",
                      ].join(" ")}
                      onClick={() => onSelect(location)}
                      title={`${location.code} · ${location.variant?.sku ?? t(STATE_LABELS.empty)} · ${t(STATE_LABELS[location.state])}`}
                      aria-label={`${location.code}, ${t(STATE_LABELS[location.state])}`}
                    />
                  );
                })}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
