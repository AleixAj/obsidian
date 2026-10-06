import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Small messages at the bottom of the screen ("Added to wishlist").
 * They close by themselves after a few seconds.
 *
 * "Added to bag" doesn't use one: it opens the cart drawer instead.
 */
interface Toast {
  id: number;
  message: string;
  /** "gold" = all good, "warn" = something failed */
  variant: "gold" | "warn";
}

interface ToastContextValue {
  toasts: Toast[];
  push: (message: string, variant?: Toast["variant"]) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback(
    (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  const push = useCallback<ToastContextValue["push"]>(
    (message, variant = "gold") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, variant }]);
      // 2.6 seconds: enough to read it, short enough not to bother.
      window.setTimeout(() => dismiss(id), 2600);
    },
    [dismiss],
  );

  // The same object between renders, so the components that use it
  // only re-render when the toasts really change.
  const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.variant}`}>
            <span className="toast-star">✦</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>");
  return ctx;
}
