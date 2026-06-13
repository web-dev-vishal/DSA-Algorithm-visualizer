import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(), // Tailwind CSS v4 — CSS-first, no tailwind.config.js needed
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Matches "paths" in tsconfig.json
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, "/api/v1"),
      },
    },
  },
});
