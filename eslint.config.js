const js = require("@eslint/js");
const globals = require("globals");

export default [
  {
    files: ["**/*.test.js"],
    languageOptions: {
      globals: {
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly"
      }
    }
  }
];
