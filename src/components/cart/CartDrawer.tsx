import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { MAX_QTY, useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { useCheckout, useUser } from "../../hooks/queries";
import { apiErrorMessage } from "../../lib/api";
import { formatPrice } from "../../utils/format";
import { Icon } from "../ui/Icon";
import { Placeholder } from "../ui/Placeholder";
import { catalogColour, catalogSize } from "../../i18n/catalog";
import type { CartItem } from "../../types";

// Same rule as the API checkout (CheckoutController), in cents.
/** Free shipping from €200. */
const FREE_SHIP_AT_CENTS = 20000;
/** Flat shipping below that. */
const FLAT_SHIPPING_CENTS = 800;

/**
 * Side drawer showing the cart's content.
 *
 * Renders both the backdrop (for click-outside-to-close) and the
 * panel itself. Visibility is driven by the `isOpen` flag from
 * `CartContext`, which is flipped to `true` when a product is added.
 */
export function CartDrawer() {
  const { t } = useTranslation();
  const { items, isOpen, close, subtotalCents, updateQty, remove } = useCart();
  const { data: user, isPending: isUserPending } = useUser();
  const checkout = useCheckout();
  const navigate = useNavigate();
  const location = useLocation();
  const { push } = useToast();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // While open: focus the close button and close on `Escape`.
  // When it closes, focus goes back to the button that opened it.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [isOpen, close]);

  const remainingCents = Math.max(0, FREE_SHIP_AT_CENTS - subtotalCents);
  const pct = Math.min(100, (subtotalCents / FREE_SHIP_AT_CENTS) * 100);
  const shippingCents = remainingCents > 0 ? FLAT_SHIPPING_CENTS : 0;
  const totalCents = subtotalCents + shippingCents;

  const handleCheckout = () => {
    if (!user) {
      push(t("cart.signInToCheckout"));
      close();
      navigate(`/auth?returnTo=${encodeURIComponent(location.pathname)}`);
      return;
    }

    checkout.mutate(undefined, {
      onSuccess: (order) => {
        push(t("cart.orderPlaced", { number: order.number }));
        close();
        navigate("/account/orders");
      },
      onError: (error) => {
        push(apiErrorMessage(error) ?? t("cart.failed"), "warn");
      },
    });
  };

  return (
    <>
      <div className={`drawer-backdrop ${isOpen ? "open" : ""}`} onClick={close} />
      {/* `inert` when closed: the hidden drawer can't get keyboard focus. */}
      <aside
        className={`drawer ${isOpen ? "open" : ""}`}
        aria-hidden={!isOpen}
        inert={!isOpen}
        aria-label={t("cart.label")}
      >
        <div className="drawer-head">
          <h3>
            {t("cart.title")} <span className="ct">({items.length})</span>
          </h3>
          <button type="button" className="drawer-close" onClick={close} ref={closeButtonRef}>
            {t("cart.close")}
          </button>
        </div>

        {items.length > 0 && (
          <div className="drawer-progress">
            <div className="row">
              <span>
                {remainingCents > 0
                  ? t("cart.untilFree", { amount: formatPrice(remainingCents / 100) })
                  : t("cart.freeUnlocked")}
              </span>
              <span className="pct">{Math.round(pct)}%</span>
            </div>
            <div className="track">
              <div style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="drawer-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="title">{t("cart.empty.title")}</div>
              <div className="sub">{t("cart.empty.sub")}</div>
            </div>
          ) : (
            items.map((line, i) => (
              <div key={`${line.id}-${line.size}-${line.colorHex}`} className="cart-item">
                <Placeholder palette={line.palette} corner={false} img={line.img} />
                <div className="info">
                  <div className="nm">{line.name}</div>
                  <div className="meta">
                    {line.size && `${t("cart.size", { size: catalogSize(line.size) })} · `}
                    {colourName(line) ?? t("cart.defaultColor")}
                  </div>
                  <div className="qty">
                    <button type="button" onClick={() => updateQty(i, -1)} aria-label={t("cart.decrease")}>
                      −
                    </button>
                    <span>{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(i, +1)}
                      aria-label={t("cart.increase")}
                      disabled={line.qty >= MAX_QTY}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="price">
                  <span>{formatPrice(line.price * line.qty)}</span>
                  <button type="button" className="remove" onClick={() => remove(i)}>
                    {t("cart.remove")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="row">
              <span>{t("cart.subtotal")}</span>
              <span>{formatPrice(subtotalCents / 100)}</span>
            </div>
            <div className="row">
              <span>{t("cart.shipping")}</span>
              <span>{shippingCents > 0 ? formatPrice(shippingCents / 100) : t("cart.free")}</span>
            </div>
            <div className="row total">
              <span>{t("cart.total")}</span>
              <span className="val">{formatPrice(totalCents / 100)}</span>
            </div>
            <button
              type="button"
              className="btn-checkout"
              onClick={handleCheckout}
              disabled={checkout.isPending || isUserPending}
            >
              {checkout.isPending ? t("cart.placing") : t("cart.checkout")} <Icon.Arrow />
            </button>
            <div className="free-ship">
              {t("cart.note")}<span className="gold">{t("cart.noteGold")}</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

/** The translated name of the colour picked for a line, if we know it. */
function colourName(line: CartItem): string | undefined {
  const colour = line.colors.find((c) => c.hex === line.colorHex);
  return colour ? catalogColour(colour.name) : undefined;
}
