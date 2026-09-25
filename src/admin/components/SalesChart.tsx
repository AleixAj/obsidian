import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import type { Dashboard } from "../api";
import { chartLabel, money } from "../format";

/**
 * Sales chart: this period (gold area) vs the previous one (grey dashed line).
 * Built with Recharts. The colours come from the shop's design tokens.
 * `byHour` is true for the "Today" range: the labels show hours, not days.
 */
export function SalesChart({ points, byHour }: { points: Dashboard["chart"]; byHour: boolean }) {
  const { t } = useTranslation("admin");
  // Recharts works with plain numbers, so we pass euros instead of cents.
  const data = points.map((point) => ({
    // The date is formatted here, so it follows the chosen language.
    label: chartLabel(point.date, byHour),
    current: point.sales_cents / 100,
    previous: point.previous_sales_cents / 100,
  }));

  return (
    <div className="adm-chart">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4af37" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#221f1a" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#4a463f"
            tick={{ fill: "#8a847a", fontSize: 11, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            stroke="#4a463f"
            tick={{ fill: "#8a847a", fontSize: 11, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(value: number) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(value))}
          />
          <Tooltip
            contentStyle={{ background: "#111", border: "1px solid #2e2a23", borderRadius: 2, fontSize: 12 }}
            labelStyle={{ color: "#8a847a" }}
            formatter={(value, name) => [
              money(Number(value) * 100),
              name === "current" ? t("chart.thisPeriod") : t("chart.previous"),
            ]}
          />
          <Line
            type="monotone"
            dataKey="previous"
            stroke="#5a554c"
            strokeDasharray="4 4"
            strokeWidth={1.2}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="current"
            stroke="#d4af37"
            strokeWidth={1.8}
            fill="url(#goldFill)"
            activeDot={{ r: 4, fill: "#d4af37" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
