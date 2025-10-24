/* Basic root ESLint config for TS/Node and packages */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  env: {
    es2022: true,
    node: true,
  },
  ignorePatterns: ['dist', '.next', 'coverage', 'node_modules'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
};

