import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { downloadExport, type ExportFormat, type ExportSection } from "../api";
import { AdminIcon } from "./AdminIcon";

interface ExportButtonsProps {
  section: ExportSection;
  /** The filters of the list, so the file has the same rows you see. */
  filters?: Record<string, string | number | undefined>;
}

/** "Export: CSV · Excel" buttons used on every list page. */
export function ExportButtons({ section, filters = {} }: ExportButtonsProps) {
  const { push } = useToast();
  const [loading, setLoading] = useState<ExportFormat | null>(null);

  async function handleExport(format: ExportFormat) {
    setLoading(format);
    try {
      await downloadExport(section, filters, format);
    } catch {
      push("Could not export the list.", "warn");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="adm-export" role="group" aria-label="Export">
      <span className="adm-export-label">
        <AdminIcon.Download /> Export
      </span>
      <button type="button" onClick={() => handleExport("csv")} disabled={loading !== null}>
        {loading === "csv" ? "…" : "CSV"}
      </button>
      <button type="button" onClick={() => handleExport("xlsx")} disabled={loading !== null}>
        {loading === "xlsx" ? "…" : "Excel"}
      </button>
    </div>
  );
}
