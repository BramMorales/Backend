const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node, // require, module, process, __dirname ✅
      },
      sourceType: "commonjs",
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
  js.configs.recommended,
];
