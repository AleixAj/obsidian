import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useDemoLogin, useLogin, useUser } from "../../hooks/queries";
import { ApiError } from "../../lib/api";
import { LanguageSwitch } from "../../components/ui/LanguageSwitch";
import type { Role } from "../api";

/**
 * The three demo accounts. The role name and what each one can do
 * come from admin.json ("roles.admin", "login.can.admin"...).
 */
const DEMO_ROLES: { role: Role; name: string }[] = [
  { role: "admin", name: "Aleix Auqué" },
  { role: "warehouse", name: "Javier Molina" },
  { role: "support", name: "Lucía Fernández" },
];

/**
 * Admin sign-in page. Visitors can try the panel with one click
 * ("demo" buttons) or sign in with a real staff account.
 */
export function AdminLogin() {
  const { t } = useTranslation("admin");
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
    ? t("login.demoNotInstalled")
    : demoLogin.error
      ? t("login.demoFailed")
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

        <h1>{t("login.title")}</h1>
        <p className="adm-login-lead">{t("login.lead")}</p>

        {noAccess && <div className="adm-alert">{t("login.noAccess")}</div>}

        <div className="adm-demo-list">
          {DEMO_ROLES.map((demo) => (
            <button
              key={demo.role}
              type="button"
              className="adm-demo-btn"
              onClick={() => demoLogin.mutate(demo.role)}
              disabled={demoLogin.isPending}
            >
              <span className="adm-demo-role">{t(`roles.${demo.role}`)}</span>
              <strong>{t("login.enterAs", { name: demo.name })}</strong>
              <span className="adm-demo-can">{t(`login.can.${demo.role}`)}</span>
            </button>
          ))}
        </div>
        {demoError && <div className="adm-alert">{demoError}</div>}
        <p className="adm-muted adm-small">{t("login.demoReset")}</p>

        <div className="adm-divider">{t("login.divider")}</div>

        <form className="adm-login-form" onSubmit={handleSubmit}>
          <label>
            {t("login.email")}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label>
            {t("login.password")}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {login.isError && <div className="adm-alert">{t("login.wrongPassword")}</div>}
          <button type="submit" className="adm-btn adm-btn--gold" disabled={login.isPending}>
            {login.isPending ? t("login.signingIn") : t("login.signIn")}
          </button>
        </form>
      </div>
    </div>
  );
}
