// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'prettier', 'eslint:recommended', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['prettier', '@typescript-eslint', 'import', 'unused-imports'],
  rules: {
    'prettier/prettier': 'error',
    'import/order': 'error',
    'react-native/no-inline-styles': 0,
    'import/namespace': 0,
    'no-duplicate-imports': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': 'error',
    '@typescript-eslint/no-namespace': 'off',
    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': ['error', { ignoreDeclarationMerge: true }],
  },
};
