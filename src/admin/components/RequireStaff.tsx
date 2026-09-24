import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../hooks/queries";

/**
 * Only lets staff users (with a role) into the panel.
 * Others are sent to the admin login page.
 *
 * This is just for the user experience: the real protection is in the
 * API, which answers 401/403 to anyone without the right permission.
 */
export function RequireStaff({ children }: { children: ReactNode }) {
  const { data: user, isPending } = useUser();

  if (isPending) {
    return <div className="adm-loading">Checking session…</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!user.role) {
    return <Navigate to="/admin/login?denied=1" replace />;
  }

  return children;
}

/**
 * Hides a page from roles that don't have its permission
 * (e.g. someone typing /admin/orders in the URL by hand).
 */
export function RequirePermission({ permission, children }: { permission: string; children: ReactNode }) {
  const { data: user } = useUser();

  if (!user?.permissions.includes(permission)) {
    return (
      <div className="adm-empty">
        <strong>No access</strong>
        <span>Your role can't open this section.</span>
      </div>
    );
  }

  return children;
}
