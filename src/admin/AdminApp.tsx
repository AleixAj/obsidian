import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { RequirePermission, RequireStaff } from "./components/RequireStaff";
import { AdminLogin } from "./pages/AdminLogin";
import { ComingSoon } from "./pages/ComingSoon";
import { CustomerDetail } from "./pages/CustomerDetail";
import { Customers } from "./pages/Customers";
import { OrderDetail } from "./pages/OrderDetail";
import { Orders } from "./pages/Orders";
import { Overview } from "./pages/Overview";
import { ProductEdit } from "./pages/ProductEdit";
import { Products } from "./pages/Products";
import "./admin.css";

/** Shortcut so each route below fits in one line. */
function only(permission: string, page: ReactNode) {
  return <RequirePermission permission={permission}>{page}</RequirePermission>;
}

/**
 * Admin panel routes (everything under /admin).
 *
 * This file is loaded lazily from App.tsx, so shop visitors never
 * download the panel code, its styles or the chart library.
 */
export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />

      <Route
        element={
          <RequireStaff>
            <AdminLayout />
          </RequireStaff>
        }
      >
        <Route index element={<Overview />} />

        <Route path="orders" element={only("orders", <Orders />)} />
        <Route path="orders/:id" element={only("orders", <OrderDetail />)} />

        <Route path="products" element={only("stock", <Products />)} />
        <Route path="products/new" element={only("products", <ProductEdit />)} />
        <Route path="products/:slug" element={only("stock", <ProductEdit />)} />

        <Route path="customers" element={only("customers", <Customers />)} />
        <Route path="customers/:id" element={only("customers", <CustomerDetail />)} />

        {/* Returns, users and the 3D warehouse come in the next phases. */}
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}
