const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    // supabase/functions/** runs on Deno (Deno.serve, npm:/jsr: import
    // specifiers, no @/ path alias) — a different runtime and toolchain
    // from the Expo/Node code this config is written for. Lint it with
    // `deno lint` instead (see supabase/functions/README.md).
    ignores: ['dist/*', 'scripts/*', 'jest.config.js', 'jest.setup.js', '.expo/**', 'supabase/functions/**'],
  },
];
