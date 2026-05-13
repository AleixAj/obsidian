import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Order of CSS imports matters: tokens → globals → page-specific.
import "./styles/variables.css";
import "./styles/globals.css";
import "./styles/pages.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
