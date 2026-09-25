import { execSync } from "node:child_process";

/**
 * Runs once before all the tests: puts the demo data back to its
 * starting point, so every run begins from the same orders and stock.
 */
export default function globalSetup() {
  const apiDir = process.env.API_DIR ?? "../obsidian-api";
  execSync("php artisan admin:demo", { cwd: apiDir, stdio: "inherit" });
}
