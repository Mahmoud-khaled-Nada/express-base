export default [
  {
    files: ["**/*.ts"],
    languageOptions: { parser: await import("@typescript-eslint/parser") },
    plugins: { "@typescript-eslint": await import("@typescript-eslint/eslint-plugin") },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
    }
  }
];
