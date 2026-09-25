/**
 * Sidebar sections of the admin panel.
 *
 * `permission` must match the API permissions (App\Enums\Role in
 * obsidian-api). A section is only shown if the user's role has it.
 * `soon` marks sections planned for the next versions.
 * `label` is a translation key (admin.json), shown with t(item.label).
 */

import type { AdminIconName } from "./components/AdminIcon";

export interface NavItem {
  path: string;
  label: string;
  icon: AdminIconName;
  permission: string;
  soon?: boolean;
}

export const MAIN_NAV: NavItem[] = [
  { path: "/admin", label: "nav.overview", icon: "Overview", permission: "dashboard" },
  { path: "/admin/orders", label: "nav.orders", icon: "Orders", permission: "orders" },
  { path: "/admin/products", label: "nav.products", icon: "Products", permission: "stock" },
  { path: "/admin/customers", label: "nav.customers", icon: "Customers", permission: "customers" },
  { path: "/admin/returns", label: "nav.returns", icon: "Returns", permission: "returns" },
  { path: "/admin/users", label: "nav.users", icon: "Users", permission: "users" },
];

// Logistics tools.
export const LOGISTICS_NAV: NavItem[] = [
  { path: "/admin/warehouse", label: "nav.warehouse", icon: "Warehouse", permission: "stock" },
];

export function canSee(permissions: string[], item: NavItem): boolean {
  return permissions.includes(item.permission);
}
