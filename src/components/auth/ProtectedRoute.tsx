/**
 * Route guard for pages that require a real Laravel/Sanctum session.
 *
 * While React Query checks `/api/user`, we keep the user on a branded
 * loading card. If the API returns 401, we redirect to `/auth` with a
 * `returnTo` query param so login can bring them back to the intended
 * dashboard section.
 */

import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../../hooks/queries";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { data: user, isPending, isError } = useUser();

  if (isPending) {
    return (
      <main className="fade-in account">
        <div className="account-main" style={{ gridColumn: "1 / -1" }}>
          <div className="data-error" style={{ borderStyle: "solid", borderColor: "var(--line-2)" }}>
            <div className="title" style={{ color: "var(--gold)" }}>✦ Checking session…</div>
            <div>Looking for your Obsidian member cookie.</div>
          </div>
        </div>
      </main>
    );
  }

  if (isError || !user) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return children;
}
