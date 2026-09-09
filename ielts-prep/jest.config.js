module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  // supabase/functions runs on Deno, not Node/Jest — its .test.ts files use
  // Deno.test and npm:-specifier imports that only Deno's resolver
  // understands, so Jest must never try to collect them. See
  // supabase/functions/_shared/aiProviders.test.ts, run with `deno test`.
  testPathIgnorePatterns: ['/node_modules/', '/ar-poc/', '/supabase/functions/'],
};
