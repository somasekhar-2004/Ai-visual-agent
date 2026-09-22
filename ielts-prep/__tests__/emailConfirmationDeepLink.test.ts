// Regression coverage for three release-blocking real-device bugs in the
// signup confirmation flow, all fixed without touching email verification
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
//    code.
//
// 3. Redirecting to a public Supabase Storage bucket instead was verified
//    live to still fail: Supabase Storage's public object endpoint
//    deliberately forces any text/html object to be served as text/plain
//    (an anti-stored-XSS platform control with no per-object override), so
//    it could never render as a page either.
//
// The redirect now points at a static page hosted on GitHub Pages, in the
// separate github.com/somasekhar-2004/bandpath-public repo (a small public
// repo containing only static pages, no app source code) — verified live
// end-to-end (HTTP 200, Content-Type text/html, correct rendered content
// for every state) before this URL was wired in. See
// lib/confirmationPageState.ts (this repo's tested source of truth for the
// page's state logic, mirrored in that repo's index.html) and
// __tests__/confirmationPageState.test.ts for coverage that the logic can
// never render blank. README.md's "Auth redirect URL" section has the full
// explanation and the exact manual Dashboard step this can't automate.

import fs from 'fs';
import path from 'path';

describe('EMAIL_CONFIRMATION_REDIRECT_URL — the GitHub Pages page, never localhost/deep-link/Storage', () => {
  it('is the exact GitHub Pages URL', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { EMAIL_CONFIRMATION_REDIRECT_URL } = require('@/services/auth') as typeof import('@/services/auth');
    expect(EMAIL_CONFIRMATION_REDIRECT_URL).toBe('https://somasekhar-2004.github.io/bandpath-public/');
  });

  it('is a real https:// URL, never localhost, a custom-scheme deep link, or a Supabase Storage URL', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { EMAIL_CONFIRMATION_REDIRECT_URL } = require('@/services/auth') as typeof import('@/services/auth');
    expect(EMAIL_CONFIRMATION_REDIRECT_URL).toMatch(/^https:\/\//);
    expect(EMAIL_CONFIRMATION_REDIRECT_URL).not.toMatch(/localhost/i);
    expect(EMAIL_CONFIRMATION_REDIRECT_URL).not.toMatch(/^ieltsprep:\/\//);
    expect(EMAIL_CONFIRMATION_REDIRECT_URL).not.toMatch(/supabase\.co\/storage/);
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
