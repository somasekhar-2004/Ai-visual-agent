jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// expo-linking's createURL() needs a native Constants manifest to resolve
// app.json's scheme, which isn't populated in the Jest environment. Mock it
// to the same "ieltsprep://<path>" shape it produces at runtime, since
// services/auth.ts calls it at module load time (see
// EMAIL_CONFIRMATION_REDIRECT_URL).
jest.mock('expo-linking', () => ({
  createURL: (path) => `ieltsprep://${path}`,
}));
