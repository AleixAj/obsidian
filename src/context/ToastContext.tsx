import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

/**
 * Lightweight toast/notification system. Used to confirm small
 * actions like "added to wishlist" without taking over the screen.
 *
 * For "added to bag" we open the cart drawer instead, which feels
 * more native to a real e-commerce.
 */
interface Toast {
  id: number;
  message: string;
  /** "gold" = neutral confirmation, "warn" = destructive */
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
      // Auto-dismiss after 2.6s — enough to read, short enough to feel snappy.
      window.setTimeout(() => dismiss(id), 2600);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss }}>
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
