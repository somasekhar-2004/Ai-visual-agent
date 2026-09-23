const AsyncStorage = require('@react-native-async-storage/async-storage');

// AsyncStorage-backed state (e.g. the auth resend-cooldown persistence in
// hooks/useResendCooldown.ts) is deliberately real and durable *within* a
// test — that's what proves it survives a remount — but the mock's storage
// is a single in-memory object shared by every test in a file. Without this,
// a cooldown started under an email address in one test (e.g.
// "student@example.com") would still read as "active" when the next test
// mounts the same component with the same email, since nothing else resets
// it. Needs setupFilesAfterEnv (not setupFiles, in jest.setup.js) because
// `afterEach` only exists once the test framework itself has been installed.
afterEach(async () => {
  await AsyncStorage.clear();
});
