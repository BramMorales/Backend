import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node, // <-- Activa require, module, process, __dirname, etc.
      },
      sourceType: "commonjs", // <-- Indica que usas require/module.exports
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
  js.configs.recommended,
];
