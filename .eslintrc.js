// .eslintrc.js
module.exports = {
    extends: [
      "next/core-web-vitals",
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
    ],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/explicit-function-return-type": ["warn"],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  };