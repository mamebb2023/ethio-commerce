module.exports = {
  env: {
    browser: true, // Enabled browser environment since it's common in modern projects
    es2021: true, // Updated to ES2021 for modern syntax
    jest: true, // Ensures Jest-specific globals are available
    node: true, // Ensures compatibility with Node.js
  },
  extends: [
    "airbnb-base", // Base configuration for consistent JavaScript code style
    "plugin:jest/recommended", // Updated Jest plugin configuration for modern usage
    "prettier", // For integrating Prettier for code formatting
  ],
  parserOptions: {
    ecmaVersion: 2021, // Set to ES2021 for modern features like optional chaining
    sourceType: "module", // Allows ECMAScript modules
  },
  plugins: [
    "jest", // Enables Jest-specific linting rules
    "prettier", // Enforces Prettier rules
  ],
  rules: {
    "prettier/prettier": "error", // Show errors for Prettier formatting issues
    "no-console": "warn", // Allows console logs but shows warnings
    "no-underscore-dangle": "off", // Permits underscore-prefixed identifiers
    "no-shadow": "off", // Disables the no-shadow rule
    "class-methods-use-this": "off", // Allows methods without using `this`
    "max-classes-per-file": "off", // Removes restriction on multiple classes per file
    "no-restricted-syntax": ["error", "LabeledStatement", "WithStatement"],
  },
  overrides: [
    {
      files: ["*.test.js"], // Applies rules specifically for test files
      env: {
        jest: true, // Adds Jest globals for test files
      },
    },
  ],
};
