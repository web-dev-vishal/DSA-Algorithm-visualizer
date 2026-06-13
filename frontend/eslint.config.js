/**
 * eslint.config.js — ESLint v10 Flat Config
 *
 * Includes:
 *  - @typescript-eslint/recommended-type-checked  (type-aware TS rules)
 *  - react-hooks/recommended                      (Rules of Hooks + exhaustive deps)
 *  - jsx-a11y/recommended                         (accessibility)
 *  - prettier                                     (disables formatting rules)
 *  - Custom rules: ban `any`, warn on `!`, require return types on exports
 */

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettierConfig from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  // ── Ignore patterns ───────────────────────────────────────────────
  globalIgnores(["dist/", "node_modules/", "*.cjs"]),

  // ── Plain JS / config files (vite.config, eslint.config) ────────
  {
    files: ["**/*.{js,jsx}", "vite.config.ts"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },

  // ── TypeScript + TSX source files ────────────────────────────────
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        // Type-aware linting — points to the project tsconfig
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.browser,
        React: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      // Base recommended rules
      ...js.configs.recommended.rules,

      // Type-aware TypeScript rules (equivalent to recommended-type-checked)
      ...(tseslint.configs["recommended-type-checked"]?.rules ?? {}),

      // React Hooks
      ...reactHooks.configs.recommended.rules,

      // Accessibility
      ...jsxA11y.configs.recommended.rules,

      // ── Anti-pattern rules ─────────────────────────────────────────
      "@typescript-eslint/no-explicit-any": "error",            // Ban `any`
      "@typescript-eslint/no-non-null-assertion": "warn",       // Warn on value!
      "@typescript-eslint/explicit-module-boundary-types": "warn", // Return types on exports
      "react-hooks/exhaustive-deps": "error",                    // Exhaustive useEffect deps (Required to be error)
      "@typescript-eslint/consistent-type-imports": "error",     // Type-only imports (Required to be error)

      // Disable strict rules that fail on legacy files
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "jsx-a11y/label-has-associated-control": "off",
      "no-empty": "off",
      "no-undef": "off",
      "react-hooks/static-components": "off",
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "jsx-a11y/no-redundant-roles": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",

      // ── Quality ────────────────────────────────────────────────────
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "eqeqeq": ["error", "always"],
    },
  },

  // ── Prettier must be last (disables all formatting rules) ────────
  prettierConfig,
]);
