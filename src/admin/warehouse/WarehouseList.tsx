import type { WarehouseLocation } from "../api";
import { fillRatio, STATE_LABELS } from "./states";

interface ListProps {
  locations: WarehouseLocation[];
  selectedId: number | null;
  onSelect: (location: WarehouseLocation) => void;
}

/** The warehouse as a table. It only shows what matches the search and filter. */
export function WarehouseList({ locations, selectedId, onSelect }: ListProps) {
  if (locations.length === 0) {
    return (
      <div className="adm-empty">
        <strong>No locations found</strong>
        <span>Try another search or filter.</span>
      </div>
    );
  }

  return (
    <div className="adm-table-scroll">
      <table className="adm-table adm-table--cards">
        <thead>
          <tr>
            <th>Location</th>
            <th>Product</th>
            <th>Units</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location) => (
            <tr
              key={location.id}
              onClick={() => onSelect(location)}
              className={location.id === selectedId ? "is-selected" : ""}
            >
              <td data-label="Location" className="adm-mono adm-order-link">
                {location.code}
              </td>
              <td data-label="Product">
                {location.variant ? (
                  <>
                    {location.variant.product_name}
                    <small className="adm-cell-sub adm-mono">
                      {location.variant.sku} · size {location.variant.size_label}
                    </small>
                  </>
                ) : (
                  <span className="adm-muted">—</span>
                )}
              </td>
              <td data-label="Units">
                <span className="adm-mono">
                  {location.stock} / {location.capacity}
                </span>
                <span className="wh-bar">
                  <span className={`is-${location.state}`} style={{ width: `${fillRatio(location) * 100}%` }} />
                </span>
              </td>
              <td data-label="Status">
                <span className={`wh-state is-${location.state}`}>{STATE_LABELS[location.state]}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
