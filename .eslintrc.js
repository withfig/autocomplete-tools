module.exports = {
  root: true,
  env: {
    es2021: true,
  },
  extends: [
    "airbnb/base",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "prettier/prettier": "error",
    "no-restricted-syntax": "off",
    "no-continue": "off",
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"],
    "no-console": "off",
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],
    "@typescript-eslint/ban-ts-comment": "off",
    "import/extensions": "off",
    "import/prefer-default-export": "off",
    "import/no-extraneous-dependencies": ["error", { devDependencies: ["**/test/*"] }],
  },
};
