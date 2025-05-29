module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true, // <-- Це дозволяє ESLint розпізнавати describe, it, expect тощо
  },
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    semi: ["error", "always"],
    quotes: ["error", "double"],
  },
};