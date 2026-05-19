import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { WishlistProvider } from "./context/WishlistContext";

const Account = lazy(() => import("./pages/Account").then((module) => ({ default: module.Account })));
const Auth = lazy(() => import("./pages/Auth").then((module) => ({ default: module.Auth })));
const Home = lazy(() => import("./pages/Home").then((module) => ({ default: module.Home })));
const Lookbook = lazy(() => import("./pages/Lookbook").then((module) => ({ default: module.Lookbook })));
const NotFound = lazy(() => import("./pages/NotFound").then((module) => ({ default: module.NotFound })));
const Product = lazy(() => import("./pages/Product").then((module) => ({ default: module.Product })));
const Shop = lazy(() => import("./pages/Shop").then((module) => ({ default: module.Shop })));

function RouteFallback() {
  return (
    <main className="fade-in">
      <div className="data-error" style={{ borderStyle: "solid", borderColor: "var(--line-2)" }}>
        <div className="title" style={{ color: "var(--gold)" }}>Loading Obsidian…</div>
        <div>Preparing the next view.</div>
      </div>
    </main>
  );
}

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
 * Route components are lazy-loaded so the first payload stays focused
 * on the shell and current page.
 */
export default function App() {
  return (
    <ToastProvider>
      <WishlistProvider>
        <CartProvider>
          <BrowserRouter>
            <Layout>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />

                  {/* Shop redirects `/shop` to the default category. */}
                  <Route path="/shop" element={<Navigate to="/shop/new" replace />} />
                  <Route path="/shop/:cat" element={<Shop />} />

                  <Route path="/product/:id" element={<Product />} />
                  <Route path="/lookbook" element={<Lookbook />} />

                  <Route path="/auth" element={<Auth />} />

                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <Account />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/:section"
                    element={
                      <ProtectedRoute>
                        <Account />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          </BrowserRouter>
        </CartProvider>
      </WishlistProvider>
    </ToastProvider>
  );
}
