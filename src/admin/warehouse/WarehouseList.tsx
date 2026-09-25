import { useTranslation } from "react-i18next";
import type { WarehouseLocation } from "../api";
import { fillRatio, STATE_LABELS } from "./states";

interface ListProps {
  locations: WarehouseLocation[];
  selectedId: number | null;
  onSelect: (location: WarehouseLocation) => void;
}

/** The warehouse as a table. It only shows what matches the search and filter. */
export function WarehouseList({ locations, selectedId, onSelect }: ListProps) {
  const { t } = useTranslation("admin");
  if (locations.length === 0) {
    return (
      <div className="adm-empty">
        <strong>{t("warehouse.list.empty")}</strong>
        <span>{t("warehouse.list.emptyHint")}</span>
      </div>
    );
  }

  return (
    <div className="adm-table-scroll">
      <table className="adm-table adm-table--cards">
        <thead>
          <tr>
            <th>{t("warehouse.list.location")}</th>
            <th>{t("common.product")}</th>
            <th>{t("common.units")}</th>
            <th>{t("common.status")}</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr
              key={location.id}
              onClick={() => onSelect(location)}
              className={location.id === selectedId ? "is-selected" : ""}
            >
              <td data-label={t("warehouse.list.location")} className="adm-mono adm-order-link">
                {location.code}
              </td>
              <td data-label={t("common.product")}>
                {location.variant ? (
                  <>
                    {location.variant.product_name}
                    <small className="adm-cell-sub adm-mono">
                      {t("warehouse.list.skuSize", { sku: location.variant.sku, size: location.variant.size_label })}
                    </small>
                  </>
                ) : (
                  <span className="adm-muted">—</span>
                )}
              </td>
              <td data-label={t("common.units")}>
                <span className="adm-mono">
                  {location.stock} / {location.capacity}
                </span>
                <span className="wh-bar">
                  <span className={`is-${location.state}`} style={{ width: `${fillRatio(location) * 100}%` }} />
                </span>
              </td>
              <td data-label={t("common.status")}>
                <span className={`wh-state is-${location.state}`}>{t(STATE_LABELS[location.state])}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
