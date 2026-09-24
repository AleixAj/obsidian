import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { RequirePermission, RequireStaff } from "./components/RequireStaff";
import { AdminLogin } from "./pages/AdminLogin";
import { ComingSoon } from "./pages/ComingSoon";
import { OrderDetail } from "./pages/OrderDetail";
import { Orders } from "./pages/Orders";
import { Overview } from "./pages/Overview";
import "./admin.css";

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
        <Route
          path="orders"
          element={
            <RequirePermission permission="orders">
              <Orders />
            </RequirePermission>
          }
        />
        <Route
          path="orders/:id"
          element={
            <RequirePermission permission="orders">
              <OrderDetail />
            </RequirePermission>
          }
        />
        {/* Products, customers, returns, users and warehouse come in the next phases. */}
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}
