import { expect, test, type Page } from "@playwright/test";

/**
 * The main flow of the project, from the customer to each staff role:
 *
 *   1. A customer asks to return an order (shop account page).
 *   2. Customer support approves it and gives the money back.
 *   3. The customer sees the refund.
 *   4. The warehouse prepares a paid order, and can't open customers.
 *   5. The admin sees the overview and the team.
 *
 * Every test starts with a new, empty browser (no cookies), and they run
 * in this order because each one uses what the previous one did.
 */
test.describe.configure({ mode: "serial" });

/** Opens the admin login and clicks the "Enter as ..." demo button. */
async function enterAdminAs(page: Page, name: string) {
  await page.goto("/admin/login");
  await page.getByRole("button", { name: new RegExp(`Enter as ${name}`) }).click();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
}

test("a customer asks to return a delivered order", async ({ page }) => {
  await page.goto("/auth");
  await page.getByRole("button", { name: "Demo customer" }).click();
  await expect(page).toHaveURL(/\/account/);

  await page.goto("/account/orders");
  await page.getByRole("button", { name: /Request a return/ }).first().click();
  await page.getByLabel("Reason").selectOption("wrong_size");
  await page.getByRole("button", { name: "Send request" }).click();

  await expect(page.getByText(/We received your return request/)).toBeVisible();
});

test("customer support approves and refunds the return", async ({ page }) => {
  await enterAdminAs(page, "Laia Puig");

  // Support sees returns, but not products & stock.
  const nav = page.getByRole("navigation", { name: "Admin sections" });
  await expect(nav.getByRole("link", { name: /Returns/ })).toBeVisible();
  await expect(nav.getByRole("link", { name: /Products & stock/ })).toHaveCount(0);

  await nav.getByRole("link", { name: /Returns/ }).click();
  // The return asked in the first test is the one from "Obsidian Demo".
  await page.getByRole("row", { name: /Obsidian Demo/ }).getByRole("link").click();

  await page.getByRole("button", { name: "Approve return" }).click();
  // The status badge is next to the return number, in the page title.
  const title = page.getByRole("heading", { level: 1 });
  await expect(title).toContainText("Approved");

  await page.getByRole("button", { name: /^Refund €/ }).click();
  await expect(title).toContainText("Refunded");
  await expect(page.getByText(/SIM-RF-/)).toBeVisible();
});

test("the customer sees the refund", async ({ page }) => {
  await page.goto("/auth");
  await page.getByRole("button", { name: "Demo customer" }).click();
  // Wait until the demo login finishes before opening another page.
  await expect(page).toHaveURL(/\/account/);
  await page.goto("/account/orders");

  await expect(page.getByText(/Refund done/)).toBeVisible();
});

test("the warehouse prepares a paid order but can't open customers", async ({ page }) => {
  await enterAdminAs(page, "Omar Haddad");

  await page.goto("/admin/orders?status=paid");
  const firstOrder = page.getByRole("row").nth(1).getByRole("link");
  const number = await firstOrder.innerText();
  await firstOrder.click();

  await page.getByRole("button", { name: "Start preparing" }).click();
  await expect(page.getByText(`Order ${number} is now preparing.`)).toBeVisible();
  await expect(page.getByText(/Paid → Preparing/)).toBeVisible();
  await expect(page.getByText(/by Omar Haddad/)).toBeVisible();

  // Typing the URL by hand doesn't help: the page (and the API) say no.
  await page.goto("/admin/customers");
  await expect(page.getByText("No access")).toBeVisible();
});

test("the admin sees the overview and the team", async ({ page }) => {
  await enterAdminAs(page, "Marta Soler");

  await expect(page.getByText("Sales", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "7 days" }).click();
  await expect(page.getByRole("heading", { name: "Sales · last 7 days" })).toBeVisible();

  await page.getByRole("link", { name: /Users & roles/ }).click();
  await expect(page.getByText("Laia Puig")).toBeVisible();
  // The shared demo admin can't change the team.
  await expect(page.getByText(/changes to the team are turned off/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Add to the team" })).toBeDisabled();
});
