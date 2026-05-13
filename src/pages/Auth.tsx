import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../components/ui/Icon";
import { Placeholder } from "../components/ui/Placeholder";
import { BRAND } from "../data/products";
import { useLogin, useRegister } from "../hooks/queries";
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

export function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initial = (params.get("mode") as AuthMode) || "signin";
  const oauthError = params.get("error");

  const [tab, setTab] = useState<AuthMode>(initial);
  const [agree, setAgree] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const isSubmitting = loginMutation.isPending || registerMutation.isPending;

  const authError =
    formError ??
    (oauthError
      ? "Social login is not configured yet. Add provider credentials in the Laravel .env."
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
          setFormError("Please accept the terms before creating an account.");
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

      navigate("/account");
    } catch (error) {
      setFormError(error instanceof ApiError ? "Invalid credentials or email already in use." : "Auth failed. Try again.");
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
              FW 26 ✦ Inner Circle Members
            </div>
            <h2>
              <span>The </span>
              <span className="gold">night</span>
              <span> is</span>
              <br />
              <span>only for </span>
              <span className="gold">members</span>
              <span>.</span>
            </h2>
            <div className="perks">
              <div className="perk">
                <span className="num">12h</span>
                Early access
                <br />
                to every drop
              </div>
              <div className="perk">
                <span className="num">−15%</span>
                Birthday
                <br />
                discount
              </div>
              <div className="perk">
                <span className="num">∞</span>
                Free
                <br />
                returns
              </div>
            </div>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="small">{tab === "signin" ? "✦ Welcome back" : "✦ Join Obsidian"}</div>
          <h1>
            {tab === "signin" ? (
              <>
                Sign <span className="gold">in</span>
              </>
            ) : (
              <>
                Create <span className="gold">account</span>
              </>
            )}
          </h1>

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
              Sign in
            </button>
            <button
              type="button"
              className={tab === "signup" ? "active" : ""}
              onClick={() => setTab("signup")}
            >
              Create account
            </button>
          </div>

          {tab === "signup" && (
            <div className="field-row">
              <div className="field">
                <label htmlFor="firstName">First name</label>
                <input id="firstName" name="firstName" type="text" placeholder="First name" />
              </div>
              <div className="field">
                <label htmlFor="lastName">Last name</label>
                <input id="lastName" name="lastName" type="text" placeholder="Last name" />
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@email.com" required />
          </div>

          <div className="field">
            <label htmlFor="password">
              Password
              {tab === "signin" && <span className="hint">Forgot?</span>}
            </label>
            <input id="password" name="password" type="password" placeholder="Min. 8 characters" required minLength={8} />
          </div>

          {tab === "signup" && (
            <div
              className={`checkbox-row ${agree ? "checked" : ""}`}
              onClick={() => setAgree((v) => !v)}
            >
              <span className="box">{agree && <span style={{ fontSize: 9 }}>✓</span>}</span>
              <span>
                I agree to the <a>Terms</a> and <a>Privacy Policy</a>. Subscribe me to the Inner
                Circle newsletter for early drops and exclusive pieces.
              </span>
            </div>
          )}

          {authError && (
            <div className="auth-error" role="alert">
              {authError}
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? "Working..." : tab === "signin" ? "Sign in" : "Create account"} <Icon.Arrow />
          </button>

          <div className="divider">Or continue with</div>

          <div className="social-row">
            <button type="button" className="social-btn" onClick={() => startOAuth("google")}>
              Google
            </button>
            <button type="button" className="social-btn" onClick={() => startOAuth("github")}>
              GitHub
            </button>
          </div>

          <div className="foot-note">
            {tab === "signin" ? (
              <>
                New here?{" "}
                <a onClick={() => setTab("signup")}>Create an account ↗</a>
              </>
            ) : (
              <>
                Already a member? <a onClick={() => setTab("signin")}>Sign in ↗</a>
              </>
            )}
            <br />
            <br />
            <Link to="/" style={{ color: "var(--fg-mute)" }}>
              ← Continue as guest
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
