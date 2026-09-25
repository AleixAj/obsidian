import { lazy, Suspense } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { WarehouseLocation } from "../api";
import { AdminIcon } from "../components/AdminIcon";
import { PageHeader } from "../components/PageHeader";
import { useWarehouse } from "../hooks";
import { LocationPanel } from "../warehouse/LocationPanel";
import { matches, STATE_COLORS, STATE_LABELS, type StateFilter } from "../warehouse/states";
import { WarehouseList } from "../warehouse/WarehouseList";
import { WarehousePlan } from "../warehouse/WarehousePlan";

// The 3D code (Three.js) is big, so it's only downloaded when this view opens.
const WarehouseScene = lazy(() => import("../warehouse/WarehouseScene"));

type View = "3d" | "plan" | "list";

const VIEWS: { value: View; label: string }[] = [
  { value: "3d", label: "3D" },
  { value: "plan", label: "Plan" },
  { value: "list", label: "List" },
];

const FILTERS: { value: StateFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
  { value: "empty", label: "Free" },
];

/** Some old computers or browsers can't draw 3D (WebGL). Then we start on the plan. */
function canUse3D(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

const HAS_3D = canUse3D();

// On phones the 3D view is small and hard to move, so the plan opens first.
// The 3D button is still there for anyone who wants it.
const DEFAULT_VIEW: View = HAS_3D && window.innerWidth >= 640 ? "3d" : "plan";

/**
 * Warehouse page: the same data in three views (3D, plan, list),
 * a search, filters, a summary and the details of the chosen location.
 *
 * What's on screen lives in the URL (?view=plan&location=B-04-2&q=hoodie),
 * so a link opens the same view and location for someone else.
 */
export function Warehouse() {
  const { data: warehouse, isPending, isError } = useWarehouse();
  const [params, setParams] = useSearchParams();

  const view = (params.get("view") as View | null) ?? DEFAULT_VIEW;
  const filter = (params.get("filter") as StateFilter | null) ?? "all";
  const search = params.get("q") ?? "";
  const selectedCode = params.get("location");

  /** Changes one value in the URL, keeping the others. */
  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  if (isPending) return <div className="adm-loading">Loading the warehouse…</div>;
  if (isError) return <div className="adm-empty">Could not load the warehouse.</div>;

  const { summary } = warehouse;
  // Always read the selected location from the latest data, so it updates after a restock.
  const selected = warehouse.locations.find((l) => l.code === selectedCode) ?? null;
  const isMatch = (location: WarehouseLocation) => matches(location, search, filter);
  const select = (location: WarehouseLocation | null) => setParam("location", location?.code ?? null);

  return (
    <>
      <PageHeader
        title="Warehouse · Barcelona"
        subtitle={`${warehouse.locations.length} locations · ${warehouse.layout.aisles.length} aisles`}
        actions={
          <div className="adm-segmented" role="group" aria-label="View">
            {VIEWS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={view === option.value ? "is-active" : ""}
                onClick={() => setParam("view", option.value)}
                disabled={option.value === "3d" && !HAS_3D}
                title={option.value === "3d" && !HAS_3D ? "Your browser can't show 3D" : undefined}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      <section className="wh-summary">
        <div className="adm-card adm-kpi">
          <span className="adm-kpi-label">Occupancy</span>
          <strong className="adm-kpi-value">{summary.occupancy}%</strong>
          <span className="adm-kpi-change">{summary.units.toLocaleString("en")} units stored</span>
        </div>
        <button type="button" className="adm-card adm-kpi wh-kpi-button" onClick={() => setParam("filter", "low")}>
          <span className="adm-kpi-label">Low stock</span>
          <strong className="adm-kpi-value wh-text-low">{summary.low}</strong>
          <span className="adm-kpi-change">locations to restock</span>
        </button>
        <button type="button" className="adm-card adm-kpi wh-kpi-button" onClick={() => setParam("filter", "out")}>
          <span className="adm-kpi-label">Out of stock</span>
          <strong className="adm-kpi-value wh-text-out">{summary.out}</strong>
          <span className="adm-kpi-change">locations with 0 units</span>
        </button>
        <Link to="/admin/orders?status=paid" className="adm-card adm-kpi wh-kpi-button">
          <span className="adm-kpi-label">To pick</span>
          <strong className="adm-kpi-value">{summary.orders_to_pick}</strong>
          <span className="adm-kpi-change">orders paid or preparing</span>
        </Link>
      </section>

      <div className="adm-toolbar">
        <div className="adm-tabs" role="tablist" aria-label="Filter by status">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={filter === option.value}
              className={filter === option.value ? "is-active" : ""}
              onClick={() => setParam("filter", option.value === "all" ? null : option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="adm-search adm-search--inline">
          <AdminIcon.Search />
          <input
            type="search"
            value={search}
            onChange={(e) => setParam("q", e.target.value || null)}
            placeholder="SKU, product or location (B-04-2)"
            aria-label="Search the warehouse"
          />
        </label>
      </div>

      <div className={`wh-layout${selected ? " has-panel" : ""}`}>
        <div className="adm-card wh-view">
          {view === "3d" && (
            <>
              <Suspense fallback={<div className="adm-loading">Loading 3D view…</div>}>
                <div className="wh-canvas">
                  <WarehouseScene
                    warehouse={warehouse}
                    selectedId={selected?.id ?? null}
                    onSelect={select}
                    isMatch={isMatch}
                  />
                </div>
              </Suspense>
              <p className="wh-hint adm-muted adm-small">Drag to turn · scroll to zoom · click a box to see it</p>
            </>
          )}
          {view === "plan" && (
            <WarehousePlan warehouse={warehouse} selectedId={selected?.id ?? null} onSelect={select} isMatch={isMatch} />
          )}
          {view === "list" && (
            <WarehouseList
              locations={warehouse.locations.filter(isMatch)}
              selectedId={selected?.id ?? null}
              onSelect={select}
            />
          )}

          {view !== "list" && (
            <div className="wh-legend" aria-label="Legend">
              {(Object.keys(STATE_LABELS) as (keyof typeof STATE_LABELS)[]).map((state) => (
                <span key={state}>
                  <i style={{ background: STATE_COLORS[state] }} /> {STATE_LABELS[state]}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* key: a new location starts with a clean panel (no half-filled form). */}
        {selected && <LocationPanel key={selected.id} location={selected} onClose={() => select(null)} />}
      </div>
    </>
  );
}
