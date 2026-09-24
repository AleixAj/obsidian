import { useLocation } from "react-router-dom";
import { LOGISTICS_NAV, MAIN_NAV } from "../navigation";
import { PageHeader } from "../components/PageHeader";

/** Placeholder for sections planned in the next versions of the panel. */
export function ComingSoon() {
  const { pathname } = useLocation();
  const section = [...MAIN_NAV, ...LOGISTICS_NAV].find((item) => item.path === pathname);

  return (
    <>
      <PageHeader title={section?.label ?? "Not found"} />
      <div className="adm-empty">
        <strong>{section ? "Coming soon" : "This page doesn't exist"}</strong>
        {section && <span>This section is part of the next version of the panel.</span>}
      </div>
    </>
  );
}
