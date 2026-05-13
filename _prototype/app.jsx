// ===========================================
// OBSIDIAN — App entry + Tweaks
// ===========================================

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "goldIntensity": "balanced",
  "fontPair": "unbounded-dm",
  "heroStyle": "split",
  "density": "spacious",
  "cursorBlob": true,
  "accentHue": "#c9a14a"
}/*EDITMODE-END*/;

function applyTweaks(t) {
  const root = document.documentElement;
  root.style.setProperty("--gold", t.accentHue);

  // Font pair
  const pairs = {
    "unbounded-dm": { display: '"Unbounded","Archivo Black",sans-serif', body: '"DM Sans",system-ui,sans-serif' },
    "anton-inter": { display: '"Anton","Archivo Black",sans-serif', body: '"Inter",system-ui,sans-serif' },
    "syne-spacegrotesk": { display: '"Syne",sans-serif', body: '"Space Grotesk",sans-serif' },
  };
  const fp = pairs[t.fontPair] || pairs["unbounded-dm"];
  root.style.setProperty("--font-display", fp.display);
  root.style.setProperty("--font-body", fp.body);

  // Density
  const dens = { tight: 60, balanced: 80, spacious: 100 };
  root.style.setProperty("--section-pad", (dens[t.density] || 100) + "px");
}

function App() {
  const [view, setView] = useState({ name: "home" });
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [wishlist, setWishlist] = useState(["p2", "p4", "p5", "p7", "p9"]);
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    applyTweaks(tweaks);
  }, [tweaks]);

  // Scroll top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view.name, view.cat, view.section, view.product?.id]);

  const addToCart = (p) => {
    const size = p.size || p.sizes?.[0] || "M";
    setCart((prev) => {
      const existing = prev.findIndex(x => x.id === p.id && x.size === size);
      if (existing > -1) {
        const copy = [...prev];
        copy[existing] = { ...copy[existing], qty: copy[existing].qty + 1 };
        return copy;
      }
      return [...prev, { ...p, size, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (idx, delta) => {
    setCart((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], qty: Math.max(1, copy[idx].qty + delta) };
      return copy;
    });
  };

  const removeItem = (idx) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleWishlist = (id) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const openAccount = (section = "overview") => {
    if (!signedIn) {
      setView({ name: "auth", mode: "signin" });
    } else {
      setView({ name: "account", section });
    }
  };

  return (
    <>
      {tweaks.cursorBlob && <CursorBlob />}

      <div className="announce">
        <Marquee items={[
          "✦ Drop 04 — Aurum Live Now",
          "Free shipping over €200",
          "Inner Circle ✦ Early access",
          "Made in Porto · Cast in gold",
          "Limited to 200 units per piece",
        ]} />
      </div>

      <Header
        view={view}
        setView={setView}
        cart={cart}
        wishlist={wishlist}
        signedIn={signedIn}
        onOpenCart={() => setCartOpen(true)}
        onOpenAccount={() => openAccount("overview")}
        onOpenWishlist={() => openAccount("wishlist")}
      />

      {view.name === "home" && <HomePage setView={setView} onAddToCart={addToCart} />}
      {view.name === "plp" && <PLP cat={view.cat || "new"} setView={setView} onAddToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />}
      {view.name === "pdp" && <PDP product={view.product} setView={setView} onAddToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />}
      {view.name === "auth" && (
        <Auth
          mode={view.mode || "signin"}
          setView={setView}
          onSuccess={() => { setSignedIn(true); setView({ name: "account", section: "overview" }); }}
        />
      )}
      {view.name === "account" && (
        <Account
          setView={setView}
          initialSection={view.section || "overview"}
          wishlist={wishlist}
          setWishlist={setWishlist}
          onAddToCart={addToCart}
          onSignOut={() => { setSignedIn(false); setView({ name: "home" }); }}
        />
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        updateQty={updateQty}
        removeItem={removeItem}
        setView={setView}
      />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Aesthetics" />
        <TweakRadio
          label="Gold intensity"
          value={tweaks.goldIntensity}
          options={[
            { value: "subtle", label: "Subtle" },
            { value: "balanced", label: "Balanced" },
            { value: "bold", label: "Bold" },
          ]}
          onChange={(v) => setTweak("goldIntensity", v)}
        />
        <TweakColor
          label="Accent color"
          value={tweaks.accentHue}
          options={["#c9a14a", "#d4af37", "#b8860b", "#e8c87a", "#a87f2a"]}
          onChange={(v) => setTweak("accentHue", v)}
        />

        <TweakSection label="Typography" />
        <TweakSelect
          label="Font pair"
          value={tweaks.fontPair}
          options={[
            { value: "unbounded-dm", label: "Unbounded ✦ DM Sans" },
            { value: "anton-inter", label: "Anton ✦ Inter" },
            { value: "syne-spacegrotesk", label: "Syne ✦ Space Grotesk" },
          ]}
          onChange={(v) => setTweak("fontPair", v)}
        />

        <TweakSection label="Layout" />
        <TweakRadio
          label="Density"
          value={tweaks.density}
          options={[
            { value: "tight", label: "Tight" },
            { value: "balanced", label: "Balanced" },
            { value: "spacious", label: "Spacious" },
          ]}
          onChange={(v) => setTweak("density", v)}
        />
        <TweakToggle
          label="Cursor blob"
          value={tweaks.cursorBlob}
          onChange={(v) => setTweak("cursorBlob", v)}
        />
        <TweakToggle
          label="Signed in"
          value={signedIn}
          onChange={(v) => setSignedIn(v)}
        />

        <TweakSection label="Shop" />
        <TweakButton label="Home" onClick={() => setView({ name: "home" })} />
        <TweakButton label="PLP / Shop" onClick={() => setView({ name: "plp", cat: "new" })} />
        <TweakButton label="PDP / Bomber" onClick={() => setView({ name: "pdp", product: PRODUCTS[1] })} />
        <TweakButton label="Add to bag" onClick={() => { addToCart(PRODUCTS[0]); }} />

        <TweakSection label="User" />
        <TweakButton label="Sign in / Sign up" onClick={() => setView({ name: "auth", mode: "signin" })} />
        <TweakButton label="Account Overview" onClick={() => { setSignedIn(true); setView({ name: "account", section: "overview" }); }} />
        <TweakButton label="Orders" onClick={() => { setSignedIn(true); setView({ name: "account", section: "orders" }); }} />
        <TweakButton label="Wishlist" onClick={() => { setSignedIn(true); setView({ name: "account", section: "wishlist" }); }} />
        <TweakButton label="Addresses" onClick={() => { setSignedIn(true); setView({ name: "account", section: "addresses" }); }} />
        <TweakButton label="Settings" onClick={() => { setSignedIn(true); setView({ name: "account", section: "settings" }); }} />
        <TweakButton label="Inner Circle" onClick={() => { setSignedIn(true); setView({ name: "account", section: "rewards" }); }} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
