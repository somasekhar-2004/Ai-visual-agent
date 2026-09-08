const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', 'scripts/*', 'jest.config.js', 'jest.setup.js', '.expo/**'],
  },
];
