module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:@withfig/fig-linter/recommended",
    "plugin:compat/recommended",
  ],
  env: {
    browser: true,
  },
  plugins: ["@withfig/fig-linter"],
  rules: {
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "no-unused-vars": ["off"],
    "no-var": ["off"],
    "@typescript-eslint/no-unused-vars": ["off"],
  },
};
