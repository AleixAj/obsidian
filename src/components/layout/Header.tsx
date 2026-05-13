import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useUser } from "../../hooks/queries";
import { Icon } from "../ui/Icon";
import { Logo } from "../ui/Logo";

/**
 * Top-level navigation.
 *
 * Desktop layout: 3-column grid (nav · logo · tools).
 * On tablet/mobile the inline nav collapses behind a hamburger that
 * opens a full-height drawer.
 */
const NAV_ITEMS: { to: string; label: string; end?: boolean }[] = [
  { to: "/", label: "Home", end: true },
  { to: "/shop/men", label: "Men" },
  { to: "/shop/women", label: "Women" },
  { to: "/lookbook", label: "Lookbook" },
];

/** Scrolls the page to the top instantly. Used on logo/home clicks. */
function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function Header() {
  const { totalCount, open: openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { data: user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close the mobile menu whenever we navigate away.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock the page scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <nav className="header-nav" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={scrollTop}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className={`hamburger ${mobileOpen ? "open" : ""}`}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <Logo onClick={scrollTop} />

          <div className="header-tools">
            <button type="button" aria-label="Search">
              <Icon.Search /> <span className="tool-label">Search</span>
            </button>
            <button type="button" aria-label="Wishlist" onClick={() => navigate("/account/wishlist")}>
              <Icon.Heart />
              {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
            </button>
            <button type="button" aria-label="Account" onClick={() => navigate(user ? "/account" : "/auth")}>
              <Icon.User /> <span className="tool-label">{user ? "Account" : "Sign in"}</span>
            </button>
            <button type="button" aria-label="Bag" onClick={openCart}>
              <Icon.Bag /> <span className="tool-label">Bag</span>
              {totalCount > 0 && <span className="bag-count">{totalCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-nav ${mobileOpen ? "open" : ""}`} aria-hidden={!mobileOpen}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={scrollTop}
          >
            {item.label}
          </NavLink>
        ))}
        <div className="tools">
          <button type="button" onClick={() => navigate(user ? "/account" : "/auth")}>
            {user ? "Account" : "Sign in / Create account"}
          </button>
          <button type="button" onClick={() => navigate("/account")}>
            Account
          </button>
        </div>
      </div>
    </>
  );
}
