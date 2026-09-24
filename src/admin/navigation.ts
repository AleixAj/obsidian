/**
 * Sidebar sections of the admin panel.
 *
 * `permission` must match the API permissions (App\Enums\Role in
 * obsidian-api). A section is only shown if the user's role has it.
 * `soon` marks sections planned for the next versions.
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
  { path: "/admin", label: "Overview", icon: "Overview", permission: "dashboard" },
  { path: "/admin/orders", label: "Orders", icon: "Orders", permission: "orders" },
  { path: "/admin/products", label: "Products & stock", icon: "Products", permission: "products", soon: true },
  { path: "/admin/customers", label: "Customers", icon: "Customers", permission: "customers", soon: true },
  { path: "/admin/returns", label: "Returns", icon: "Returns", permission: "returns", soon: true },
  { path: "/admin/users", label: "Users & roles", icon: "Users", permission: "users", soon: true },
];

// Logistics tools. The 3D warehouse view will live here.
export const LOGISTICS_NAV: NavItem[] = [
  { path: "/admin/warehouse", label: "Warehouse 3D", icon: "Warehouse", permission: "products", soon: true },
];

export function canSee(permissions: string[], item: NavItem): boolean {
  return permissions.includes(item.permission);
}
