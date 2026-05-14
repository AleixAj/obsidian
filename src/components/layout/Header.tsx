import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useLogout, useProducts, useUser } from "../../hooks/queries";
import { formatPrice } from "../../utils/format";
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
  { to: "/shop/new", label: "New" },
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
  const logoutMutation = useLogout();
  const { data: products = [], refetch: refetchProducts } = useProducts();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const searchTerm = searchQuery.trim().toLowerCase();
  const isWishlistPage = location.pathname === "/account/wishlist";
  const isAccountPage = location.pathname === "/account" || location.pathname.startsWith("/account/");
  const searchResults = useMemo(() => {
    if (!searchTerm) return products.slice(0, 6);

    return products
      .filter((product) => {
        const searchable = [
          product.name,
          product.cat,
          product.tag ?? "",
          product.cats.join(" "),
          product.colors.join(" "),
          product.sizes.join(" "),
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(searchTerm);
      })
      .slice(0, 8);
  }, [products, searchTerm]);

  // Close the mobile menu whenever we navigate away.
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Lock the page scroll while an overlay menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;

    const id = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchOpen]);

  const openSearch = () => {
    setMobileOpen(false);
    void refetchProducts();
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const goToProduct = (productId: string) => {
    navigate(`/product/${productId}`);
    closeSearch();
    scrollTop();
  };

  const handleSignOut = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
  };

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
            <button type="button" aria-label="Search" onClick={openSearch}>
              <Icon.Search /> <span className="tool-label">Search</span>
            </button>
            <button
              type="button"
              className={`wishlist-tool ${isWishlistPage ? "active" : ""}`}
              aria-label="Wishlist"
              aria-pressed={isWishlistPage}
              onClick={() => navigate("/account/wishlist")}
            >
              <Icon.Heart />
              {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
            </button>
            <div className="account-menu">
              <button
                type="button"
                className={`account-tool ${isAccountPage ? "active" : ""}`}
                aria-label="Account"
                aria-pressed={isAccountPage}
                onClick={() => navigate(user ? "/account" : "/auth")}
              >
                <Icon.User /> <span className="tool-label">{user ? "Account" : "Sign in"}</span>
              </button>
              {user && (
                <div className="account-menu-panel" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    disabled={logoutMutation.isPending}
                  >
                    <Icon.LogOut />
                    <span>{logoutMutation.isPending ? "Signing out..." : "Sign out"}</span>
                  </button>
                </div>
              )}
            </div>
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
          <button type="button" onClick={openSearch}>
            Search
          </button>
        </div>
      </div>

      <div className={`search-overlay ${searchOpen ? "open" : ""}`} aria-hidden={!searchOpen}>
        <button type="button" className="search-backdrop" aria-label="Close search" onClick={closeSearch} />
        <section className="search-panel" role="dialog" aria-modal="true" aria-label="Search products">
          <div className="search-panel-head">
            <div>
              <div className="section-eyebrow">Search ✦ Catalogue</div>
              <h2>Find your piece</h2>
            </div>
            <button type="button" className="search-close" aria-label="Close search" onClick={closeSearch}>
              <Icon.Close />
            </button>
          </div>

          <div className="search-input-wrap">
            <Icon.Search />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search hoodie, outerwear, men..."
            />
          </div>

          <div className="search-results" aria-live="polite">
            {searchResults.length > 0 ? (
              searchResults.map((product) => (
                <button
                  type="button"
                  className="search-result"
                  key={product.id}
                  onClick={() => goToProduct(product.id)}
                >
                  <span className="thumb" style={{ backgroundImage: `url(${product.img})` }} />
                  <span className="meta">
                    <span className="name">{product.name}</span>
                    <span className="cat">{product.cat}</span>
                  </span>
                  <span className="price">{formatPrice(product.price)}</span>
                </button>
              ))
            ) : (
              <div className="search-empty">
                No pieces found.
                <br />
                Try "hoodie", "outerwear" or "women".
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
