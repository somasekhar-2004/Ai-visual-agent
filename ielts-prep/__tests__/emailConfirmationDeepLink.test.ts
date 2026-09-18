// Regression coverage for the release-blocking real-device bug: tapping a
// signup confirmation link opened localhost:3000 and failed with
// ERR_FAILED. Root cause was entirely a Supabase Dashboard setting (the
// app's deep link was never added to Auth -> URL Configuration -> Redirect
// URLs, so Supabase silently fell back to its default Site URL,
// http://localhost:3000) — see services/auth.ts's
// EMAIL_CONFIRMATION_REDIRECT_URL comment and README.md's "Auth redirect
// URL" section for the full explanation and the exact manual fix. These
// tests prove the app side was (and remains) correct: it builds a real
// custom-scheme deep link, never a localhost/web URL, and app.json is
// configured with the scheme that link depends on.

import fs from 'fs';
import path from 'path';

describe('app.json declares the custom URL scheme the confirmation deep link depends on', () => {
  it('has a non-empty top-level "scheme"', () => {
    const appJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'app.json'), 'utf8'));
    expect(typeof appJson.expo.scheme).toBe('string');
    expect(appJson.expo.scheme.length).toBeGreaterThan(0);
    expect(appJson.expo.scheme).toBe('ieltsprep');
  });
});

describe('EMAIL_CONFIRMATION_REDIRECT_URL', () => {
  afterEach(() => jest.resetModules());

  it('is built from Linking.createURL, never a hardcoded/web URL', () => {
    jest.doMock('expo-linking', () => ({ createURL: jest.fn((path: string) => `ieltsprep://${path}`) }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { EMAIL_CONFIRMATION_REDIRECT_URL } = require('@/services/auth') as typeof import('@/services/auth');
    expect(EMAIL_CONFIRMATION_REDIRECT_URL).toBe('ieltsprep://confirm');
    expect(EMAIL_CONFIRMATION_REDIRECT_URL).not.toMatch(/localhost/i);
  });

  it('resolves to the confirm route regardless of what Linking.createURL returns for other environments', () => {
    // A dev-client/Expo Go environment would legitimately return something
    // like exp://192.168.1.5:8081/--/confirm here — still never localhost
    // in the http:// sense and always ends in /confirm.
    jest.doMock('expo-linking', () => ({ createURL: jest.fn((path: string) => `exp://192.168.1.5:8081/--/${path}`) }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { EMAIL_CONFIRMATION_REDIRECT_URL } = require('@/services/auth') as typeof import('@/services/auth');
    expect(EMAIL_CONFIRMATION_REDIRECT_URL).toMatch(/\/confirm$/);
  });
});

describe('app/confirm.tsx handles the deep link Supabase redirects to', () => {
  it('exists as a route file (so ieltsprep://confirm resolves to it via Expo Router)', () => {
    const confirmRoute = path.join(__dirname, '..', 'app', 'confirm.tsx');
    expect(fs.existsSync(confirmRoute)).toBe(true);
  });
});
