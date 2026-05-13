// ===========================================
// OBSIDIAN — Auth (Sign in / Create account)
// ===========================================

const { useState: useAuthState } = React;

function Auth({ mode = "signin", onSuccess, setView }) {
  const [tab, setTab] = useAuthState(mode);
  const [agree, setAgree] = useAuthState(false);

  return (
    <main className="fade-in">
      <section className="auth">
        <div className="auth-side">
          <Placeholder palette="warm" corner={false} img={IMAGES.authHero} />
          <div className="overlay">
            <div className="badge">
              <span className="dot"></span>
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
              <div className="perk"><span className="num">12h</span>Early access<br />to every drop</div>
              <div className="perk"><span className="num">−15%</span>Birthday<br />discount</div>
              <div className="perk"><span className="num">∞</span>Free<br />returns</div>
            </div>
          </div>
        </div>

        <div className="auth-form">
          <div className="small">
            {tab === "signin" ? "✦ Welcome back" : "✦ Join Obsidian"}
          </div>
          <h1>
            {tab === "signin" ? (
              <>Sign <span style={{ color: "var(--gold)", fontFamily: "serif", fontStyle: "italic", fontWeight: 400 }}>in</span></>
            ) : (
              <>Create <span style={{ color: "var(--gold)", fontFamily: "serif", fontStyle: "italic", fontWeight: 400 }}>account</span></>
            )}
          </h1>

          <div className="auth-tabs">
            <div className="ind" style={{ transform: tab === "signin" ? "translateX(0)" : "translateX(100%)" }}></div>
            <button className={tab === "signin" ? "active" : ""} onClick={() => setTab("signin")}>Sign in</button>
            <button className={tab === "signup" ? "active" : ""} onClick={() => setTab("signup")}>Create account</button>
          </div>

          {tab === "signup" && (
            <div className="field-row">
              <div className="field">
                <label>First name</label>
                <input type="text" defaultValue="Wo" placeholder="First name" />
              </div>
              <div className="field">
                <label>Last name</label>
                <input type="text" defaultValue="Müller" placeholder="Last name" />
              </div>
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <input type="email" defaultValue="wo@obsidian.com" placeholder="you@email.com" />
          </div>

          <div className="field">
            <label>
              Password
              {tab === "signin" && <span className="hint">Forgot?</span>}
            </label>
            <input type="password" defaultValue="••••••••••" placeholder="Min. 8 characters" />
          </div>

          {tab === "signup" && (
            <div className={`checkbox-row ${agree ? "checked" : ""}`} onClick={() => setAgree(!agree)}>
              <span className="box">{agree && <span style={{ fontSize: 9 }}>✓</span>}</span>
              <span>
                I agree to the <a>Terms</a> and <a>Privacy Policy</a>. Subscribe me to the Inner Circle newsletter for early drops and exclusive pieces.
              </span>
            </div>
          )}

          <button className="btn-submit" onClick={onSuccess}>
            {tab === "signin" ? "Sign in" : "Create account"} <Icon.arrow />
          </button>

          <div className="divider">Or continue with</div>

          <div className="social-row">
            <button className="social-btn">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M7 0a7 7 0 1 0 7 7c0-.4 0-.8-.1-1.2H7v2.4h3.9c-.2.9-.7 1.7-1.5 2.2v1.9h2.4C13.2 11 14 9.1 14 7c0-.4 0-.8-.1-1.2 0 0 0 0 0 0z" opacity="0.9"/>
              </svg>
              Google
            </button>
            <button className="social-btn">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M11.2 7.4c0-2.2 1.8-3.3 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.6.8-3.3.8s-1.7-.8-2.9-.8c-1.5 0-2.9.9-3.6 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.8 2.2 1.1 0 1.5-.7 2.9-.7s1.7.7 2.9.7c1.2 0 2-1 2.7-2 .9-1.2 1.2-2.3 1.3-2.3 0 0-2.5-1-2.5-3.7zM9 1.3c.6-.7 1-1.7.9-2.7-.8.1-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 1.9-.4 2.5-1.2z"/>
              </svg>
              Apple
            </button>
          </div>

          <div className="foot-note">
            {tab === "signin" ? (
              <>New here? <a onClick={() => setTab("signup")}>Create an account ↗</a></>
            ) : (
              <>Already a member? <a onClick={() => setTab("signin")}>Sign in ↗</a></>
            )}
            <br />
            <br />
            <a onClick={() => setView({ name: "home" })} style={{ color: "var(--fg-mute)" }}>← Continue as guest</a>
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { Auth });
