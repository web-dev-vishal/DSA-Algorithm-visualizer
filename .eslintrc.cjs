// @ts-check

/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
    // Enables type-aware rules (e.g. recommended-type-checked)
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  extends: [
    "eslint:recommended",
    // Type-aware TypeScript rules — catches more errors than the plain recommended set
    "plugin:@typescript-eslint/recommended-type-checked",
    // Enforces the Rules of Hooks and exhaustive useEffect deps
    "plugin:react-hooks/recommended",
    // Accessibility: warns on missing alt text, bad ARIA usage, etc.
    "plugin:jsx-a11y/recommended",
    // Must be LAST: disables all ESLint formatting rules that Prettier handles
    "prettier",
  ],
  plugins: ["@typescript-eslint", "react-hooks", "jsx-a11y"],
  settings: {
    react: { version: "detect" },
  },
  rules: {
    // ── TypeScript anti-patterns ─────────────────────────────────────
    "@typescript-eslint/no-explicit-any": "error",         // Ban `any` — use `unknown` instead
    "@typescript-eslint/no-non-null-assertion": "warn",    // Warn on `value!` — could throw at runtime
    "@typescript-eslint/explicit-module-boundary-types": "warn", // Require return types on exported functions

    // ── Hooks ────────────────────────────────────────────────────────
    "react-hooks/exhaustive-deps": "warn",                 // Warn when useEffect deps are incomplete

    // ── General quality ──────────────────────────────────────────────
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "eqeqeq": ["error", "always"],

    // ── Allow some patterns needed in Vite/React projects ───────────
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
  ignorePatterns: ["dist/", "node_modules/", "*.cjs"],
};
