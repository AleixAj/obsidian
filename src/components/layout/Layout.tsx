import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { CartDrawer } from "../cart/CartDrawer";
import { AnnounceBar } from "./AnnounceBar";
import { Footer } from "./Footer";
import { Header } from "./Header";

/**
 * Site shell that wraps every routed page.
 *
 * Responsibilities:
 *   - Mounts the `Header`, `Footer`, `AnnounceBar`, `CartDrawer`.
 *   - Scrolls back to the top on every route change so the user
 *     never lands halfway down a freshly mounted page.
 *
 * Excludes the footer on auth/account screens where the dashboard
 * already fills the viewport.
 */
interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  const isFullBleed =
    location.pathname.startsWith("/auth") || location.pathname.startsWith("/account");

  return (
    <>
      <AnnounceBar />
      <Header />
      {children}
      {!isFullBleed && <Footer />}
      <CartDrawer />
    </>
  );
}
