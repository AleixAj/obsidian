import { useState, type FormEvent } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useDemoLogin, useLogin, useUser } from "../../hooks/queries";
import { ApiError } from "../../lib/api";
import { LanguageSwitch } from "../../components/ui/LanguageSwitch";
import type { Role } from "../api";

/** The three demo accounts, with what each one can do. */
const DEMO_ROLES: { role: Role; title: string; name: string; can: string }[] = [
  {
    role: "admin",
    title: "Administrator",
    name: "Aleix Auqué",
    can: "Everything: sales, orders, products, customers, returns and users.",
  },
  {
    role: "warehouse",
    title: "Warehouse",
    name: "Javier Molina",
    can: "Orders and stock. Prepares and ships orders.",
  },
  {
    role: "support",
    title: "Customer support",
    name: "Lucía Fernández",
    can: "Orders, customers and returns.",
  },
];

/**
 * Admin sign-in page. Visitors can try the panel with one click
 * ("demo" buttons) or sign in with a real staff account.
 */
export function AdminLogin() {
  const [params] = useSearchParams();
  const { data: user } = useUser();
  const demoLogin = useDemoLogin();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Already signed in as staff → go straight to the panel.
  if (user?.role) {
    return <Navigate to="/admin" replace />;
  }

  // Signed in, but as a normal customer (no role).
  const noAccess = params.get("denied") === "1" || (user && !user.role);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    login.mutate({ email, password });
  }

  const demoError = demoLogin.error instanceof ApiError && demoLogin.error.status === 503
    ? "Demo data is not installed on the server yet."
    : demoLogin.error
      ? "Could not start the demo. Try again."
      : null;

  return (
    <div className="adm-login">
      <div className="adm-login-card">
        <div className="adm-login-top">
          <Link to="/" className="adm-brand">
            <img src="/obsidian-logo.png" alt="" />
            <span>OBSIDIAN</span>
            <em>Admin</em>
          </Link>
          <LanguageSwitch />
        </div>

        <h1>Back office</h1>
        <p className="adm-login-lead">
          Orders, sales and stock of the Obsidian store. Try it with demo data: each role sees
          different sections, and the API checks every permission.
        </p>

        {noAccess && <div className="adm-alert">This account has no access to the admin panel.</div>}

        <div className="adm-demo-list">
          {DEMO_ROLES.map((demo) => (
            <button
              key={demo.role}
              type="button"
              className="adm-demo-btn"
              onClick={() => demoLogin.mutate(demo.role)}
              disabled={demoLogin.isPending}
            >
              <span className="adm-demo-role">{demo.title}</span>
              <strong>Enter as {demo.name}</strong>
              <span className="adm-demo-can">{demo.can}</span>
            </button>
          ))}
        </div>
        {demoError && <div className="adm-alert">{demoError}</div>}
        <p className="adm-muted adm-small">
          Demo data resets every 24 hours, so feel free to change things. File uploads are off for the demo accounts.
        </p>

        <div className="adm-divider">or sign in with a staff account</div>

        <form className="adm-login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {login.isError && <div className="adm-alert">Wrong email or password.</div>}
          <button type="submit" className="adm-btn adm-btn--gold" disabled={login.isPending}>
            {login.isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
