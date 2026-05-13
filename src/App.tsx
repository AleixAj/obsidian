import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { CursorBlob } from "./components/ui/CursorBlob";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { WishlistProvider } from "./context/WishlistContext";
import { Account } from "./pages/Account";
import { Auth } from "./pages/Auth";
import { Home } from "./pages/Home";
import { Lookbook } from "./pages/Lookbook";
import { NotFound } from "./pages/NotFound";
import { Product } from "./pages/Product";
import { Shop } from "./pages/Shop";

/**
 * Root component.
 *
 * Composition order matters:
 *   1. `ToastProvider`     → notifications.
 *   2. `WishlistProvider`  → wishlist state (persisted).
 *   3. `CartProvider`      → cart state (persisted).
 *   4. `BrowserRouter`     → URL → component mapping.
 *   5. `Layout`            → header / footer / cart drawer shell.
 *
 * The router lives inside the providers so any route can read or
 * write to those contexts, including the layout itself.
 */
export default function App() {
  return (
    <ToastProvider>
      <WishlistProvider>
        <CartProvider>
          <BrowserRouter>
            <CursorBlob />
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />

                {/* Shop redirects `/shop` to the default category. */}
                <Route path="/shop" element={<Navigate to="/shop/new" replace />} />
                <Route path="/shop/:cat" element={<Shop />} />

                <Route path="/product/:id" element={<Product />} />
                <Route path="/lookbook" element={<Lookbook />} />

                <Route path="/auth" element={<Auth />} />

                <Route path="/account" element={<Account />} />
                <Route path="/account/:section" element={<Account />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </CartProvider>
      </WishlistProvider>
    </ToastProvider>
  );
}
