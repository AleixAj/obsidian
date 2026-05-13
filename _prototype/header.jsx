// ===========================================
// OBSIDIAN — Header + Cart Drawer
// ===========================================

const { useState: useHState, useEffect: useHEffect } = React;

function Header({ view, setView, cart, wishlist = [], signedIn = false, onOpenCart, onOpenAccount, onOpenWishlist }) {
  const cartCount = cart.reduce((a, b) => a + b.qty, 0);
  return (
    <header className="header">
      <div className="header-inner">
        <nav className="header-nav">
          <a onClick={() => setView({ name: "plp", cat: "new" })} className="has-dot">New In</a>
          <a onClick={() => setView({ name: "plp", cat: "men" })}>Men</a>
          <a onClick={() => setView({ name: "plp", cat: "women" })}>Women</a>
          <a onClick={() => setView({ name: "plp", cat: "outerwear" })}>Outerwear</a>
          <a onClick={() => setView({ name: "plp", cat: "archive" })}>Archive</a>
          <a onClick={() => setView({ name: "home" })}>Lookbook</a>
        </nav>

        <div className="logo" onClick={() => setView({ name: "home" })}>
          <span className="logo-mark-eclipse">
            <span className="ec-outer"></span>
            <span className="ec-inner"></span>
          </span>
          <span>OBSIDIAN</span>
        </div>

        <div className="header-tools">
          <button><Icon.search /> Search</button>
          <button onClick={onOpenWishlist}>
            <Icon.heart />
            {wishlist.length > 0 && <span className="bag-count" style={{ background: "transparent", color: "var(--gold)", border: "1px solid var(--gold-soft)", marginLeft: 2 }}>{wishlist.length}</span>}
          </button>
          <button onClick={onOpenAccount}>
            <Icon.user /> {signedIn ? "Account" : "Sign in"}
          </button>
          <button onClick={onOpenCart}>
            <Icon.bag /> Bag
            {cartCount > 0 && <span className="bag-count">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

function CartDrawer({ open, onClose, cart, updateQty, removeItem, setView }) {
  const subtotal = cart.reduce((a, b) => a + b.price * b.qty, 0);
  const freeShipAt = 200;
  const remain = Math.max(0, freeShipAt - subtotal);
  const pct = Math.min(100, (subtotal / freeShipAt) * 100);

  return (
    <>
      <div className={`drawer-backdrop ${open ? "open" : ""}`} onClick={onClose}></div>
      <aside className={`drawer ${open ? "open" : ""}`}>
        <div className="drawer-head">
          <h3>Your Bag <span className="ct">({cart.length})</span></h3>
          <button className="drawer-close" onClick={onClose}>Close ✕</button>
        </div>

        <div style={{ padding: "16px 24px 0" }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em",
            textTransform: "uppercase", color: "var(--fg-dim)",
            display: "flex", justifyContent: "space-between", marginBottom: 8
          }}>
            <span>{remain > 0 ? `${formatPrice(remain)} until free shipping` : "Free shipping unlocked"}</span>
            <span style={{ color: "var(--gold)" }}>{Math.round(pct)}%</span>
          </div>
          <div style={{ height: 2, background: "var(--line)", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${pct}%`, background: "var(--gold)",
              transition: "width 0.4s var(--ease)"
            }}></div>
          </div>
        </div>

        <div className="drawer-items">
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--fg-dim)" }}>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 24, color: "var(--fg)",
                marginBottom: 12, textTransform: "uppercase", letterSpacing: "-0.02em"
              }}>Your bag is empty</div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em",
                textTransform: "uppercase"
              }}>Pieces are waiting in the drop</div>
            </div>
          ) : cart.map((item, i) => (
            <div key={i} className="cart-item">
              <Placeholder label="" palette={item.palette} corner={false} img={item.img} />
              <div className="info">
                <div className="nm">{item.name}</div>
                <div className="meta">Size {item.size} · {item.colorName || "Default"}</div>
                <div className="qty">
                  <button onClick={() => updateQty(i, -1)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(i, 1)}>+</button>
                </div>
              </div>
              <div className="price">
                <span>{formatPrice(item.price * item.qty)}</span>
                <button className="remove" onClick={() => removeItem(i)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="row"><span>Shipping</span><span>{remain > 0 ? formatPrice(8) : "FREE"}</span></div>
            <div className="row total">
              <span>Total</span><span className="val">{formatPrice(remain > 0 ? subtotal + 8 : subtotal)}</span>
            </div>
            <button className="btn-checkout">
              Checkout <Icon.arrow />
            </button>
            <div className="free-ship">
              Secure payment · <span className="gold">30-day returns</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

Object.assign(window, { Header, CartDrawer });
