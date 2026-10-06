import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { CartDrawer } from "../cart/CartDrawer";
import { AnnounceBar } from "./AnnounceBar";
import { Footer } from "./Footer";
import { Header } from "./Header";

/**
 * What every shop page has around it: the top bar, the header, the
 * footer and the cart drawer.
 *
 * The sign-in and account pages already fill the screen, so they have
 * no footer.
 */
interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  // A new page starts at the top, not where the last one was scrolled to.
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
