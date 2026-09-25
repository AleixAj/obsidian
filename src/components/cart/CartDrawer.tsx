import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { useCheckout, useUser } from "../../hooks/queries";
import { ApiError } from "../../lib/api";
import { formatPrice } from "../../utils/format";
import { Icon } from "../ui/Icon";
import { Placeholder } from "../ui/Placeholder";

/** Free-shipping threshold in euros. */
const FREE_SHIP_AT = 200;
/** Flat shipping rate below the threshold. */
const FLAT_SHIPPING = 8;

/**
 * Side drawer showing the cart's content.
 *
 * Renders both the backdrop (for click-outside-to-close) and the
 * panel itself. Visibility is driven by the `isOpen` flag from
 * `CartContext`, which is flipped to `true` when a product is added.
 */
export function CartDrawer() {
  const { t } = useTranslation();
  const { items, isOpen, close, subtotal, updateQty, remove } = useCart();
  const { data: user, isPending: isUserPending } = useUser();
  const checkout = useCheckout();
  const navigate = useNavigate();
  const location = useLocation();
  const { push } = useToast();

  // Close on `Escape` for accessibility.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const remaining = Math.max(0, FREE_SHIP_AT - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIP_AT) * 100);
  const total = remaining > 0 ? subtotal + FLAT_SHIPPING : subtotal;

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
        push(checkoutErrorMessage(error) ?? t("cart.failed"), "warn");
      },
    });
  };

  return (
    <>
      <div className={`drawer-backdrop ${isOpen ? "open" : ""}`} onClick={close} />
      <aside className={`drawer ${isOpen ? "open" : ""}`} aria-hidden={!isOpen} aria-label={t("cart.label")}>
        <div className="drawer-head">
          <h3>
            {t("cart.title")} <span className="ct">({items.length})</span>
          </h3>
          <button type="button" className="drawer-close" onClick={close}>
            {t("cart.close")}
          </button>
        </div>

        {items.length > 0 && (
          <div className="drawer-progress">
            <div className="row">
              <span>
                {remaining > 0
                  ? t("cart.untilFree", { amount: formatPrice(remaining) })
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
              <div key={`${line.id}-${line.size}`} className="cart-item">
                <Placeholder palette={line.palette} corner={false} img={line.img} />
                <div className="info">
                  <div className="nm">{line.name}</div>
                  <div className="meta">
                    {t("cart.size", { size: line.size })} · {line.colorName || t("cart.defaultColor")}
                  </div>
                  <div className="qty">
                    <button type="button" onClick={() => updateQty(i, -1)} aria-label={t("cart.decrease")}>
                      −
                    </button>
                    <span>{line.qty}</span>
                    <button type="button" onClick={() => updateQty(i, +1)} aria-label={t("cart.increase")}>
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
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="row">
              <span>{t("cart.shipping")}</span>
              <span>{remaining > 0 ? formatPrice(FLAT_SHIPPING) : t("cart.free")}</span>
            </div>
            <div className="row total">
              <span>{t("cart.total")}</span>
              <span className="val">{formatPrice(total)}</span>
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

/** The error message sent by the API, or undefined to show our own. */
function checkoutErrorMessage(error: unknown): string | undefined {
  if (error instanceof ApiError && isApiErrorPayload(error.payload)) {
    const firstError = Object.values(error.payload.errors ?? {})[0]?.[0];
    return firstError ?? error.payload.message;
  }

  return undefined;
}

function isApiErrorPayload(
  payload: unknown,
): payload is { message?: string; errors?: Record<string, string[]> } {
  return typeof payload === "object" && payload !== null;
}
