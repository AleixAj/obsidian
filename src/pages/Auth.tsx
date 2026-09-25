import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/ui/Icon";
import { Placeholder } from "../components/ui/Placeholder";
import { BRAND } from "../data/products";
import { useDemoLogin, useLogin, useRegister, useUser } from "../hooks/queries";
import { ApiError, oauthRedirectUrl } from "../lib/api";

/**
 * Sign-in / Sign-up page (UI mock).
 *
 * The form submits don't hit a backend yet — they just navigate to
 * the `/account` view so the rest of the flow can be demoed. When
 * real auth is plugged in, only the `handleSubmit` function below
 * needs to be replaced.
 *
 * Toggle between tabs via `?mode=signup` if you want to link straight
 * to the sign-up state.
 */
type AuthMode = "signin" | "signup";

/**
 * Only accept paths inside this site ("/account/orders"). "//evil.com" or
 * "/\evil.com" would take the user to another site, so we ignore them.
 */
function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/")) return "/account";
  if (value.startsWith("//") || value.startsWith("/\\")) return "/account";
  return value;
}

export function Auth() {
  const { t } = useTranslation("account");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initial = (params.get("mode") as AuthMode) || "signin";
  const oauthError = params.get("error");
  const returnTo = safeReturnTo(params.get("returnTo"));

  const [tab, setTab] = useState<AuthMode>(initial);
  const [agree, setAgree] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const demoMutation = useDemoLogin();
  const { data: user } = useUser();
  const isSubmitting = loginMutation.isPending || registerMutation.isPending;

  useEffect(() => {
    if (user) {
      navigate(returnTo, { replace: true });
    }
  }, [navigate, returnTo, user]);

  const authError =
    formError ??
    (oauthError
      ? t("auth.errors.oauth")
      : null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      if (tab === "signin") {
        await loginMutation.mutateAsync({ email, password });
      } else {
        if (!agree) {
          setFormError(t("auth.errors.acceptTerms"));
          return;
        }

        const firstName = String(form.get("firstName") ?? "").trim();
        const lastName = String(form.get("lastName") ?? "").trim();
        const name = [firstName, lastName].filter(Boolean).join(" ");

        await registerMutation.mutateAsync({
          name: name || email,
          email,
          password,
        });
      }

      navigate(returnTo, { replace: true });
    } catch (error) {
      setFormError(error instanceof ApiError ? t("auth.errors.invalid") : t("auth.errors.failed"));
    }
  };

  // Portfolio shortcut: sign in as the demo customer without a password.
  const startDemo = async () => {
    setFormError(null);
    try {
      await demoMutation.mutateAsync("customer");
      navigate(returnTo, { replace: true });
    } catch {
      setFormError(t("auth.errors.demo"));
    }
  };

  const startOAuth = (provider: "google" | "github") => {
    window.location.href = oauthRedirectUrl(provider);
  };

  return (
    <main className="fade-in">
      <section className="auth">
        <div className="auth-side">
          <Placeholder palette="warm" corner={false} img={BRAND.street} tint={false} />
          <div className="overlay">
            <div className="badge">
              <span className="dot" />
              {t("auth.side.badge")}
            </div>
            <h2>
              <span>{t("auth.side.title.the")}</span>
              <span className="gold">{t("auth.side.title.night")}</span>
              <span>{t("auth.side.title.is")}</span>
              <br />
              <span>{t("auth.side.title.onlyFor")}</span>
              <span className="gold">{t("auth.side.title.members")}</span>
              <span>{t("auth.side.title.end")}</span>
            </h2>
            <div className="perks">
              <div className="perk">
                <span className="num">12h</span>
                {t("auth.side.perks.earlyAccess1")}
                <br />
                {t("auth.side.perks.earlyAccess2")}
              </div>
              <div className="perk">
                <span className="num">−15%</span>
                {t("auth.side.perks.birthday1")}
                <br />
                {t("auth.side.perks.birthday2")}
              </div>
              <div className="perk">
                <span className="num">∞</span>
                {t("auth.side.perks.returns1")}
                <br />
                {t("auth.side.perks.returns2")}
              </div>
            </div>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="small">{tab === "signin" ? t("auth.eyebrow.signin") : t("auth.eyebrow.signup")}</div>
          <h1>
            {tab === "signin" ? (
              <>
                {t("auth.title.signin1")}<span className="gold">{t("auth.title.signin2")}</span>
              </>
            ) : (
              <>
                {t("auth.title.signup1")}<span className="gold">{t("auth.title.signup2")}</span>
              </>
            )}
          </h1>

          {/* Shortcut for recruiters reviewing the project: no sign up needed. */}
          <div className="auth-demo">
            <div className="auth-demo-title">{t("auth.demo.title")}</div>
            <p>{t("auth.demo.text")}</p>
            <div className="auth-demo-actions">
              <button type="button" className="social-btn" onClick={startDemo} disabled={demoMutation.isPending}>
                {demoMutation.isPending ? t("auth.demo.opening") : t("auth.demo.customer")}
              </button>
              <Link to="/admin/login" className="social-btn">
                {t("auth.demo.admin")}
              </Link>
            </div>
          </div>

          <div className="auth-tabs">
            <div
              className="ind"
              style={{ transform: tab === "signin" ? "translateX(0)" : "translateX(100%)" }}
            />
            <button
              type="button"
              className={tab === "signin" ? "active" : ""}
              onClick={() => setTab("signin")}
            >
              {t("auth.tabs.signin")}
            </button>
            <button
              type="button"
              className={tab === "signup" ? "active" : ""}
              onClick={() => setTab("signup")}
            >
              {t("auth.tabs.signup")}
            </button>
          </div>

          {tab === "signup" && (
            <div className="field-row">
              <div className="field">
                <label htmlFor="firstName">{t("auth.fields.firstName")}</label>
                <input id="firstName" name="firstName" type="text" placeholder={t("auth.fields.firstName")} />
              </div>
              <div className="field">
                <label htmlFor="lastName">{t("auth.fields.lastName")}</label>
                <input id="lastName" name="lastName" type="text" placeholder={t("auth.fields.lastName")} />
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="email">{t("auth.fields.email")}</label>
            <input id="email" name="email" type="email" placeholder={t("auth.fields.emailPlaceholder")} required />
          </div>

          <div className="field">
            <label htmlFor="password">
              {t("auth.fields.password")}
              {tab === "signin" && <span className="hint">{t("auth.fields.forgot")}</span>}
            </label>
            <input id="password" name="password" type="password" placeholder={t("auth.fields.passwordPlaceholder")} required minLength={8} />
          </div>

          {tab === "signup" && (
            <div
              className={`checkbox-row ${agree ? "checked" : ""}`}
              onClick={() => setAgree((v) => !v)}
            >
              <span className="box">{agree && <span style={{ fontSize: 9 }}>✓</span>}</span>
              <span>
                {t("auth.agree.start")}
                <Link to="/terms">{t("auth.agree.terms")}</Link>
                {t("auth.agree.and")}
                <Link to="/privacy">{t("auth.agree.privacy")}</Link>
                {t("auth.agree.end")}
              </span>
            </div>
          )}

          {authError && (
            <div className="auth-error" role="alert">
              {authError}
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? t("auth.submit.working") : tab === "signin" ? t("auth.submit.signin") : t("auth.submit.signup")}{" "}
            <Icon.Arrow />
          </button>

          <div className="divider">{t("auth.divider")}</div>

          <div className="social-row">
            <button type="button" className="social-btn" onClick={() => startOAuth("google")}>
              <Icon.Google /> Google
            </button>
            <button type="button" className="social-btn" onClick={() => startOAuth("github")}>
              <Icon.GitHub /> GitHub
            </button>
          </div>

          <div className="foot-note">
            {tab === "signin" ? (
              <>
                {t("auth.foot.newHere")}{" "}
                <a onClick={() => setTab("signup")}>{t("auth.foot.createAccount")}</a>
              </>
            ) : (
              <>
                {t("auth.foot.alreadyMember")} <a onClick={() => setTab("signin")}>{t("auth.foot.signIn")}</a>
              </>
            )}
            <br />
            <br />
            <Link to="/" style={{ color: "var(--fg-mute)" }}>
              {t("auth.foot.guest")}
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
