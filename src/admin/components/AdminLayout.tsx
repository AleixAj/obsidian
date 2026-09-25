import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useLogout, useUser } from "../../hooks/queries";
import { authKeys } from "../../hooks/queries/useAuth";
import { mediaUrl } from "../../lib/api";
import { useDashboard } from "../hooks";
import { initials, ROLE_LABELS } from "../format";
import { canSee, LOGISTICS_NAV, MAIN_NAV, type NavItem } from "../navigation";
import { LanguageSwitch } from "../../components/ui/LanguageSwitch";
import { AdminIcon } from "./AdminIcon";

/** Tooltip of the number next to a section (translation keys). */
const BADGE_TITLES: Record<string, string> = {
  "/admin/orders": "nav.badges.orders",
  "/admin/products": "nav.badges.products",
  "/admin/returns": "nav.badges.returns",
};

/**
 * Admin shell: sidebar on the left, top bar, and the current page
 * (<Outlet />) in the middle. On small screens the sidebar becomes
 * a drawer opened with the menu button.
 */
export function AdminLayout() {
  const { t } = useTranslation("admin");
  const { data: user } = useUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  // The dashboard query is cached, so this doesn't cost an extra request
  // when the Overview page is open. We only use it for the badges.
  const { data: dashboard } = useDashboard("30d");
  const badges: Record<string, number> = {
    "/admin/orders": dashboard?.badges.orders_to_prepare ?? 0,
    "/admin/products": dashboard?.badges.low_stock ?? 0,
    "/admin/returns": dashboard?.badges.returns_to_review ?? 0,
  };

  // If the session expires, src/lib/queryClient.ts forgets the user on any
  // 401, and RequireStaff sends them back to the login page.

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
        <span>{t(item.label)}</span>
        {badges[item.path] > 0 && (
          <span
            className={`adm-nav-count${item.path === "/admin/products" ? " is-warn" : ""}`}
            title={t(BADGE_TITLES[item.path])}
          >
            {badges[item.path]}
          </span>
        )}
        {item.soon && <span className="adm-nav-soon">{t("nav.soon")}</span>}
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

        <nav className="adm-nav" aria-label={t("nav.sections")}>
          {MAIN_NAV.filter((item) => canSee(permissions, item)).map(renderLink)}

          {logistics.length > 0 && (
            <>
              <div className="adm-nav-title">{t("nav.logistics")}</div>
              {logistics.map(renderLink)}
            </>
          )}

          <div className="adm-nav-title">{t("nav.store")}</div>
          <Link to="/" className="adm-nav-link">
            <AdminIcon.Store />
            <span>{t("nav.viewStore")}</span>
          </Link>
        </nav>

        <div className="adm-user">
          <div className="adm-avatar">
            {user.avatar_url ? <img src={mediaUrl(user.avatar_url)} alt="" referrerPolicy="no-referrer" /> : initials(user.name)}
          </div>
          <div className="adm-user-info">
            <strong>{user.name}</strong>
            <span>{t(ROLE_LABELS[user.role])}</span>
          </div>
          <button type="button" className="adm-icon-btn" onClick={handleLogout} aria-label={t("layout.logOut")} title={t("layout.logOut")}>
            <AdminIcon.LogOut />
          </button>
        </div>
      </aside>

      {/* Dark layer behind the mobile menu. Click it to close the menu. */}
      <div className="adm-backdrop" onClick={() => setMenuOpen(false)} />

      <div className="adm-main">
        <div className="adm-topbar">
          <button type="button" className="adm-icon-btn adm-menu-btn" onClick={() => setMenuOpen(true)} aria-label={t("layout.openMenu")}>
            <AdminIcon.Menu />
          </button>

          {permissions.includes("orders") && (
            <form className="adm-search" onSubmit={handleSearch} role="search">
              <AdminIcon.Search />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("layout.searchPlaceholder")}
                aria-label={t("layout.searchLabel")}
              />
            </form>
          )}

          <LanguageSwitch className="adm-lang" />
          <span className="adm-demo-tag">{t("layout.demoTag")}</span>
        </div>

        <main className="adm-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
