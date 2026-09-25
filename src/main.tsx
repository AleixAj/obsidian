import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Translations must be ready before the first render.
import "./i18n";
import App from "./App";
import { reloadOnce } from "./components/ErrorBoundary";
import { queryClient } from "./lib/queryClient";

// Order of CSS imports matters: tokens → globals → page-specific.
import "./styles/variables.css";
import "./styles/globals.css";
import "./styles/pages.css";

// After a new deploy, an open tab may ask for old code files that are gone.
// Vite tells us with this event: reload once to get the new version.
window.addEventListener("vite:preloadError", (event) => {
  if (reloadOnce()) event.preventDefault();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Devtools are tree-shaken out of production builds. */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  </StrictMode>,
);
