import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Apply dark mode to <html> before first render to avoid flash
const storedDark = localStorage.getItem("algviz_dark");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
if (storedDark === "1" || (storedDark === null && prefersDark)) {
  document.documentElement.classList.add("dark");
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found in index.html");

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
