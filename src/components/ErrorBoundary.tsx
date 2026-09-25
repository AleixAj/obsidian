import { Component, type ErrorInfo, type ReactNode } from "react";
import i18n from "../i18n";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** What to show instead of the broken part. By default, a message with a "Reload" button. */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches errors while drawing a part of the page, so the rest of the app
 * keeps working instead of turning into a blank screen.
 *
 * React only lets class components do this (getDerivedStateFromError),
 * that's why this one is a class and not a function.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // After a new deploy, the old page may ask for code files that don't
    // exist anymore. Reloading once gets the new version.
    if (isChunkError(error) && reloadOnce()) return;

    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;

    return (
      <main className="fade-in">
        <div className="data-error" role="alert">
          <div className="title">{i18n.t("errorBoundary.title")}</div>
          <div>{i18n.t("errorBoundary.text")}</div>
          <button type="button" className="btn" style={{ marginTop: 16 }} onClick={() => window.location.reload()}>
            {i18n.t("errorBoundary.reload")}
          </button>
        </div>
      </main>
    );
  }
}

/** True when a lazy page couldn't be downloaded (usually after a new deploy). */
function isChunkError(error: Error): boolean {
  return /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(error.message);
}

/**
 * Reloads the page, but only once every 10 seconds, so a real problem
 * (no internet, server down) doesn't turn into an endless reload loop.
 */
export function reloadOnce(): boolean {
  const key = "obsidian-reloaded-at";
  try {
    const last = Number(sessionStorage.getItem(key) ?? 0);
    if (Date.now() - last < 10_000) return false;
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    // Storage blocked: better show the error than risk a loop.
    return false;
  }
  window.location.reload();
  return true;
}
