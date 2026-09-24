import type { Kpi } from "../api";

interface KpiCardProps {
  label: string;
  kpi: Kpi;
  /** How to show the number (money, count, percentage...). */
  format: (value: number) => string;
  /**
   * For the return rate, going down is good. We also show the change
   * in points (2.1% → 2.5% = +0.4 pts) instead of a percentage.
   */
  lowerIsBetter?: boolean;
}

export function KpiCard({ label, kpi, format, lowerIsBetter = false }: KpiCardProps) {
  let changeText = "—";
  let direction = 0;

  if (lowerIsBetter) {
    const points = Math.round((kpi.value - kpi.previous) * 10) / 10;
    changeText = `${points > 0 ? "+" : ""}${points} pts`;
    direction = points;
  } else if (kpi.change !== null) {
    changeText = `${kpi.change > 0 ? "+" : ""}${kpi.change}%`;
    direction = kpi.change;
  }

  // Green when the change is good news, red when it's bad.
  const isGood = lowerIsBetter ? direction < 0 : direction > 0;
  const tone = direction === 0 ? "" : isGood ? "is-up" : "is-down";

  return (
    <div className="adm-card adm-kpi">
      <span className="adm-kpi-label">{label}</span>
      <strong className="adm-kpi-value">{format(kpi.value)}</strong>
      <span className={`adm-kpi-change ${tone}`}>
        {changeText} <span>vs previous period</span>
      </span>
    </div>
  );
}
