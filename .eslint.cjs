/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: {
    node: true,       // Enable Node.js globals (require, module, etc.)
    es2021: true,     // Enable ES2021 features
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest", // Parse modern ECMAScript
    sourceType: "module",  // Allow import/export
    project: "./tsconfig.json", // For type-aware linting (optional but recommended)
  },
  plugins: ["@typescript-eslint", "import", "node"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended", // Recommended TS rules
    "plugin:import/recommended",             // Import/export checks
    "plugin:import/typescript",              // Fix TS import resolution
    "plugin:node/recommended",               // Node.js best practices
    "prettier",                              // Disable conflicting formatting rules
  ],
  rules: {
    // --- General rules ---
    "no-console": "warn",       // Warn but don’t forbid console.log
    "no-unused-vars": "off",    // Disable base rule
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

    // --- Import rules ---
    "import/order": [
      "warn",
      {
        groups: [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]],
        "newlines-between": "always",
      },
    ],

    // --- Node.js rules ---
    "node/no-unsupported-features/es-syntax": "off", // Allow ES modules
    "node/no-missing-import": "off",                 // TS handles this
    "node/no-unpublished-import": "off",             // Ignore dev deps

    // --- TypeScript rules ---
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn",
  },
  overrides: [
    {
      files: ["*.ts"],
      rules: {
        "node/no-missing-import": "off", // Avoid false positives with TS
      },
    },
  ],
  ignorePatterns: ["dist/", "node_modules/"], // Ignore build & deps
};
