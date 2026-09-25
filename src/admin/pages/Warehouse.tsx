import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import type { WarehouseLocation } from "../api";
import { AdminIcon } from "../components/AdminIcon";
import { PageHeader } from "../components/PageHeader";
import { count } from "../format";
import { useWarehouse } from "../hooks";
import { LocationPanel } from "../warehouse/LocationPanel";
import { matches, STATE_COLORS, STATE_LABELS, type StateFilter } from "../warehouse/states";
import { WarehouseList } from "../warehouse/WarehouseList";
import { WarehousePlan } from "../warehouse/WarehousePlan";

// The 3D code (Three.js) is big, so it's only downloaded when this view opens.
const WarehouseScene = lazy(() => import("../warehouse/WarehouseScene"));

type View = "3d" | "plan" | "list";

// Texts in admin.json: "warehouse.views.3d"...
const VIEWS: View[] = ["3d", "plan", "list"];

// "label" is a translation key (admin.json).
const FILTERS: { value: StateFilter; label: string }[] = [
  { value: "all", label: "common.all" },
  { value: "low", label: STATE_LABELS.low },
  { value: "out", label: STATE_LABELS.out },
  { value: "empty", label: STATE_LABELS.empty },
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
  const { t } = useTranslation("admin");
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

  if (isPending) return <div className="adm-loading">{t("warehouse.loading")}</div>;
  if (isError) return <div className="adm-empty">{t("warehouse.loadError")}</div>;

  const { summary } = warehouse;
  // Always read the selected location from the latest data, so it updates after a restock.
  const selected = warehouse.locations.find((l) => l.code === selectedCode) ?? null;
  const isMatch = (location: WarehouseLocation) => matches(location, search, filter);
  const select = (location: WarehouseLocation | null) => setParam("location", location?.code ?? null);

  return (
    <>
      <PageHeader
        title={t("warehouse.title")}
        subtitle={t("warehouse.subtitle", {
          locations: warehouse.locations.length,
          aisles: warehouse.layout.aisles.length,
        })}
        actions={
          <div className="adm-segmented" role="group" aria-label={t("warehouse.view")}>
            {VIEWS.map((option) => (
              <button
                key={option}
                type="button"
                className={view === option ? "is-active" : ""}
                onClick={() => setParam("view", option)}
                disabled={option === "3d" && !HAS_3D}
                title={option === "3d" && !HAS_3D ? t("warehouse.no3d") : undefined}
              >
                {t(`warehouse.views.${option}`)}
              </button>
            ))}
          </div>
        }
      />

      <section className="wh-summary">
        <div className="adm-card adm-kpi">
          <span className="adm-kpi-label">{t("warehouse.summary.occupancy")}</span>
          <strong className="adm-kpi-value">{summary.occupancy}%</strong>
          <span className="adm-kpi-change">{t("warehouse.summary.unitsStored", { units: count(summary.units) })}</span>
        </div>
        <button type="button" className="adm-card adm-kpi wh-kpi-button" onClick={() => setParam("filter", "low")}>
          <span className="adm-kpi-label">{t("warehouse.summary.lowStock")}</span>
          <strong className="adm-kpi-value wh-text-low">{summary.low}</strong>
          <span className="adm-kpi-change">{t("warehouse.summary.toRestock")}</span>
        </button>
        <button type="button" className="adm-card adm-kpi wh-kpi-button" onClick={() => setParam("filter", "out")}>
          <span className="adm-kpi-label">{t("warehouse.summary.outOfStock")}</span>
          <strong className="adm-kpi-value wh-text-out">{summary.out}</strong>
          <span className="adm-kpi-change">{t("warehouse.summary.zeroUnits")}</span>
        </button>
        <Link to="/admin/orders?status=paid" className="adm-card adm-kpi wh-kpi-button">
          <span className="adm-kpi-label">{t("warehouse.summary.toPick")}</span>
          <strong className="adm-kpi-value">{summary.orders_to_pick}</strong>
          <span className="adm-kpi-change">{t("warehouse.summary.paidOrPreparing")}</span>
        </Link>
      </section>

      <div className="adm-toolbar">
        <div className="adm-tabs" role="tablist" aria-label={t("warehouse.filterByStatus")}>
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={filter === option.value}
              className={filter === option.value ? "is-active" : ""}
              onClick={() => setParam("filter", option.value === "all" ? null : option.value)}
            >
              {t(option.label)}
            </button>
          ))}
        </div>
        <label className="adm-search adm-search--inline">
          <AdminIcon.Search />
          <input
            type="search"
            value={search}
            onChange={(e) => setParam("q", e.target.value || null)}
            placeholder={t("warehouse.searchPlaceholder")}
            aria-label={t("warehouse.searchLabel")}
          />
        </label>
      </div>

      <div className={`wh-layout${selected ? " has-panel" : ""}`}>
        <div className="adm-card wh-view">
          {view === "3d" && (
            <>
              <Suspense fallback={<div className="adm-loading">{t("warehouse.loading3d")}</div>}>
                <div className="wh-canvas">
                  <WarehouseScene
                    warehouse={warehouse}
                    selectedId={selected?.id ?? null}
                    onSelect={select}
                    isMatch={isMatch}
                  />
                </div>
              </Suspense>
              <p className="wh-hint adm-muted adm-small">{t("warehouse.hint3d")}</p>
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
            <div className="wh-legend" aria-label={t("warehouse.legend")}>
              {(Object.keys(STATE_LABELS) as (keyof typeof STATE_LABELS)[]).map((state) => (
                <span key={state}>
                  <i style={{ background: STATE_COLORS[state] }} /> {t(STATE_LABELS[state])}
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
