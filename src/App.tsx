import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./components/layout/Layout";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { WishlistProvider } from "./context/WishlistContext";

// The admin panel is its own lazy chunk: shop visitors never download it.
const AdminApp = lazy(() => import("./admin/AdminApp"));
const Account = lazy(() =>
  import("./pages/Account").then((module) => ({ default: module.Account })),
);
const Auth = lazy(() =>
  import("./pages/Auth").then((module) => ({ default: module.Auth })),
);
const Home = lazy(() =>
  import("./pages/Home").then((module) => ({ default: module.Home })),
);
const Lookbook = lazy(() =>
  import("./pages/Lookbook").then((module) => ({ default: module.Lookbook })),
);
const NotFound = lazy(() =>
  import("./pages/NotFound").then((module) => ({ default: module.NotFound })),
);
const Privacy = lazy(() =>
  import("./pages/Legal").then((module) => ({ default: module.Privacy })),
);
const Terms = lazy(() =>
  import("./pages/Legal").then((module) => ({ default: module.Terms })),
);
const Product = lazy(() =>
  import("./pages/Product").then((module) => ({ default: module.Product })),
);
const Shop = lazy(() =>
  import("./pages/Shop").then((module) => ({ default: module.Shop })),
);

// Shown while a page's code downloads. It is as tall as the screen so
// the footer doesn't jump up and down when the real page arrives.
function RouteFallback() {
  const { t } = useTranslation();
  return (
    <main className="fade-in route-fallback">
      <div
        className="data-error"
        style={{ borderStyle: "solid", borderColor: "var(--line-2)" }}
      >
        <div className="title" style={{ color: "var(--gold)" }}>
          {t("loading.title")}
        </div>
        <div>{t("loading.sub")}</div>
      </div>
    </main>
  );
}

/**
 * The root of the app.
 *
 * The providers wrap everything, so any page can use the toasts, the
 * wishlist and the cart. The cart uses the toasts, so ToastProvider
 * must be outside it.
 *
 * Every page is loaded with lazy(): the browser only downloads the
 * code of the page you open, not the whole shop at once.
 */
export default function App() {
  return (
    <ToastProvider>
      <WishlistProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Admin panel: no shop header/footer, it has its own layout. */}
              <Route
                path="/admin/*"
                element={
                  <ErrorBoundary>
                    <Suspense fallback={<RouteFallback />}>
                      <AdminApp />
                    </Suspense>
                  </ErrorBoundary>
                }
              />

              <Route path="*" element={<ShopRoutes />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </WishlistProvider>
    </ToastProvider>
  );
}

/** Every shop page, inside the shop layout (header, footer, cart drawer). */
function ShopRoutes() {
  const location = useLocation();

  return (
    <Layout>
      {/* If a page breaks, the header and footer stay. The key resets the
          boundary when the user goes to another page. */}
      <ErrorBoundary key={location.pathname}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* "/shop" alone opens the new collection. */}
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

            {/* Public legal pages — also linked from Google's OAuth consent screen. */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
}
