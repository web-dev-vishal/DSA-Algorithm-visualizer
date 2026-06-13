import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { AppRouter } from "./router";
import { queryClient } from "./lib/queryClient";
import { authStore } from "./store/auth";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

/**
 * Attempt to silently rehydrate the user's session from the server
 * before the first render. This prevents a flash of the logged-out
 * state on page reload when the user has a valid refresh token.
 */
async function init(): Promise<void> {
  await authStore.rehydrate().catch(() => {
    // Silent failure — user will need to log in
  });

  createRoot(rootEl!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </StrictMode>
  );
}

init();
