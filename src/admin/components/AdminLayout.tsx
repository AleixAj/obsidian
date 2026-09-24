import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useLogout, useUser } from "../../hooks/queries";
import { authKeys } from "../../hooks/queries/useAuth";
import { ApiError, mediaUrl } from "../../lib/api";
import { useDashboard } from "../hooks";
import { initials, ROLE_LABELS } from "../format";
import { canSee, LOGISTICS_NAV, MAIN_NAV, type NavItem } from "../navigation";
import { AdminIcon } from "./AdminIcon";

/**
 * Admin shell: sidebar on the left, top bar, and the current page
 * (<Outlet />) in the middle. On small screens the sidebar becomes
 * a drawer opened with the menu button.
 */
export function AdminLayout() {
  const { data: user } = useUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  // The dashboard query is cached, so this doesn't cost an extra request
  // when the Overview page is open. We only use it for the badges.
  const { data: dashboard, error } = useDashboard("30d");
  const badges: Record<string, number> = {
    "/admin/orders": dashboard?.badges.orders_to_prepare ?? 0,
    "/admin/products": dashboard?.badges.low_stock ?? 0,
  };

  // 401 = the session expired. Forget the user so RequireStaff sends
  // them back to the login page.
  const sessionExpired = error instanceof ApiError && error.status === 401;
  useEffect(() => {
    if (sessionExpired) queryClient.setQueryData(authKeys.user, null);
  }, [sessionExpired, queryClient]);

  if (!user?.role) return null;

  const permissions = user.permissions;

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    navigate(`/admin/orders?search=${encodeURIComponent(search.trim())}`);
  }

  function handleLogout() {
    // onSettled runs on success AND on error: if the session had already
    // expired, the user is logged out anyway.
    logout.mutate(undefined, {
      onSettled: () => {
        queryClient.setQueryData(authKeys.user, null);
        navigate("/admin/login");
      },
    });
  }

  function renderLink(item: NavItem) {
    const Icon = AdminIcon[item.icon];
    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.path === "/admin"}
        className={({ isActive }) => `adm-nav-link${isActive ? " is-active" : ""}`}
        // Close the mobile menu after choosing a section.
        onClick={() => setMenuOpen(false)}
      >
        <Icon />
        <span>{item.label}</span>
        {badges[item.path] > 0 && (
          <span
            className={`adm-nav-count${item.path === "/admin/products" ? " is-warn" : ""}`}
            title={item.path === "/admin/products" ? "Variants with low stock" : "Orders to prepare"}
          >
            {badges[item.path]}
          </span>
        )}
        {item.soon && <span className="adm-nav-soon">Soon</span>}
      </NavLink>
    );
  }

  const logistics = LOGISTICS_NAV.filter((item) => canSee(permissions, item));

  return (
    <div className={`adm${menuOpen ? " menu-open" : ""}`}>
      <aside className="adm-sidebar">
        <Link to="/admin" className="adm-brand">
          <img src="/obsidian-logo.png" alt="" />
          <span>OBSIDIAN</span>
          <em>Admin</em>
        </Link>

        <nav className="adm-nav" aria-label="Admin sections">
          {MAIN_NAV.filter((item) => canSee(permissions, item)).map(renderLink)}

          {logistics.length > 0 && (
            <>
              <div className="adm-nav-title">Logistics</div>
              {logistics.map(renderLink)}
            </>
          )}

          <div className="adm-nav-title">Store</div>
          <Link to="/" className="adm-nav-link">
            <AdminIcon.Store />
            <span>View store</span>
          </Link>
        </nav>

        <div className="adm-user">
          <div className="adm-avatar">
            {user.avatar_url ? <img src={mediaUrl(user.avatar_url)} alt="" referrerPolicy="no-referrer" /> : initials(user.name)}
          </div>
          <div className="adm-user-info">
            <strong>{user.name}</strong>
            <span>{ROLE_LABELS[user.role]}</span>
          </div>
          <button type="button" className="adm-icon-btn" onClick={handleLogout} aria-label="Log out" title="Log out">
            <AdminIcon.LogOut />
          </button>
        </div>
      </aside>

      {/* Dark layer behind the mobile menu. Click it to close the menu. */}
      <div className="adm-backdrop" onClick={() => setMenuOpen(false)} />

      <div className="adm-main">
        <div className="adm-topbar">
          <button type="button" className="adm-icon-btn adm-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <AdminIcon.Menu />
          </button>

          {permissions.includes("orders") && (
            <form className="adm-search" onSubmit={handleSearch} role="search">
              <AdminIcon.Search />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search orders, customers…"
                aria-label="Search orders"
              />
            </form>
          )}

          <span className="adm-demo-tag">Demo data</span>
        </div>

        <main className="adm-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
