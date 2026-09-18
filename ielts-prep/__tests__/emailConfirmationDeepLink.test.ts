// Regression coverage for two release-blocking real-device bugs in the
// signup confirmation flow, both fixed without touching email verification
// itself (still Supabase's own /auth/v1/verify):
//
// 1. Tapping a confirmation link opened localhost:3000 and failed with
//    ERR_FAILED. Root cause was entirely a Supabase Dashboard setting (the
//    redirect URL was never added to Auth -> URL Configuration -> Redirect
//    URLs, so Supabase silently fell back to its default Site URL,
//    http://localhost:3000).
//
// 2. After that was fixed and Supabase genuinely verified the email,
//    tapping the link left the user on a blank white page — the redirect
//    pointed at the app's ieltsprep://confirm deep link, and a browser
//    failing to hand off to a custom URL scheme is a real, common failure
//    mode that varies by browser/in-app-webview and isn't fixable from app
//    code. The redirect now points at a static, always-rendering page
//    instead (supabase/static/email-confirmation.html, hosted in a public
//    Supabase Storage bucket) — see lib/confirmationPageState.ts for its
//    tested logic and __tests__/confirmationPageState.test.ts for coverage
//    that it can never render blank.
//
// See services/auth.ts's EMAIL_CONFIRMATION_REDIRECT_URL comment and
// README.md's "Auth redirect URL" section for the full explanation and the
// exact manual Dashboard step this can't automate.

import fs from 'fs';
import path from 'path';

describe('EMAIL_CONFIRMATION_REDIRECT_URL — a static Supabase Storage page, never a localhost/deep-link URL', () => {
  afterEach(() => jest.resetModules());

  it('is derived from SUPABASE_URL and points at the public-pages storage bucket, never localhost', () => {
    jest.doMock('@/lib/env', () => ({ SUPABASE_URL: 'https://kudgtxdwbpfqobteyeqy.supabase.co' }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { EMAIL_CONFIRMATION_REDIRECT_URL } = require('@/services/auth') as typeof import('@/services/auth');
    expect(EMAIL_CONFIRMATION_REDIRECT_URL).toBe(
      'https://kudgtxdwbpfqobteyeqy.supabase.co/storage/v1/object/public/public-pages/email-confirmation.html'
    );
    expect(EMAIL_CONFIRMATION_REDIRECT_URL).not.toMatch(/localhost/i);
    expect(EMAIL_CONFIRMATION_REDIRECT_URL).not.toMatch(/^ieltsprep:\/\//);
  });

  it('always resolves to a real https:// URL, never a custom-scheme deep link, regardless of which project is configured', () => {
    jest.doMock('@/lib/env', () => ({ SUPABASE_URL: 'https://some-other-project.supabase.co' }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { EMAIL_CONFIRMATION_REDIRECT_URL } = require('@/services/auth') as typeof import('@/services/auth');
    expect(EMAIL_CONFIRMATION_REDIRECT_URL).toMatch(/^https:\/\//);
    expect(EMAIL_CONFIRMATION_REDIRECT_URL).toMatch(/\/storage\/v1\/object\/public\/public-pages\/email-confirmation\.html$/);
  });
});

describe('supabase/static/email-confirmation.html — the static page the redirect points at', () => {
  const filePath = path.join(__dirname, '..', 'supabase', 'static', 'email-confirmation.html');

  it('exists in the repo (the file that gets uploaded to the public-pages bucket)', () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('never calls the Supabase API itself — reads only the redirect URL\'s own query string', () => {
    const html = fs.readFileSync(filePath, 'utf8');
    expect(html).not.toMatch(/supabase-js|createClient\(/);
    expect(html).toMatch(/window\.location\.search/);
  });

  it('always renders a visible heading and message element regardless of state (never blank markup)', () => {
    const html = fs.readFileSync(filePath, 'utf8');
    expect(html).toMatch(/id="heading"/);
    expect(html).toMatch(/id="message"/);
    // A <noscript> fallback in case JS itself fails to run at all.
    expect(html).toMatch(/<noscript>/);
  });
});

// app/confirm.tsx is intentionally kept (unused by the live flow) for
// possible future real deep-link work — see its own updated comment.
describe('app/confirm.tsx still exists, even though it is no longer the live redirect target', () => {
  it('exists as a route file', () => {
    const confirmRoute = path.join(__dirname, '..', 'app', 'confirm.tsx');
    expect(fs.existsSync(confirmRoute)).toBe(true);
  });
});
