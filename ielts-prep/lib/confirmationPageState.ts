/**
 * Canonical state logic for the email-confirmation landing page — served
 * from GitHub Pages at https://somasekhar-2004.github.io/bandpath-public/
 * (source: index.html in the separate github.com/somasekhar-2004/
 * bandpath-public repo, a small public repo containing only static pages,
 * no app source code). NOT part of this app's bundle.
 *
 * Two earlier hosting approaches were tried and ruled out by real-device
 * testing:
 *  1. app/confirm.tsx (the `ieltsprep://confirm` deep-link target): the
 *     email really was verified, but tapping the link left the user on a
 *     blank white page — a browser failing to hand off to the app's custom
 *     URL scheme, which varies by browser/in-app-webview and isn't
 *     something app code can fix.
 *  2. A public Supabase Storage bucket: confirmed live that Supabase
 *     Storage's public object endpoint deliberately forces any text/html
 *     object to be served as text/plain (an anti-stored-XSS platform
 *     control with no per-object override), so it could never render.
 * GitHub Pages has neither limitation — it always renders, in any browser.
 *
 * The confirmation itself already happened server-side by the time this
 * page's URL is even reached — Supabase's own /auth/v1/verify endpoint
 * marks the email confirmed and THEN redirects the browser here. This page
 * only needs to read the query string Supabase appended and show the right
 * message; it never calls the Supabase API itself, so there is no
 * "network state" for it beyond the page's own static assets loading.
 *
 * This file is the tested source of truth for that logic. The
 * bandpath-public repo's index.html mirrors it in plain inline JS (that
 * repo has no build step) — keep both in sync if this changes.
 */

export type ConfirmationPageStatus = 'success' | 'expired' | 'invalid' | 'error';

export type ConfirmationPageParams = {
  code?: string | null;
  error?: string | null;
  error_code?: string | null;
  error_description?: string | null;
};

export type ConfirmationPageState = {
  status: ConfirmationPageStatus;
  heading: string;
  message: string;
};

/**
 * Supabase's verify-redirect appends `?code=...` on success (a PKCE
 * authorization code for establishing a session — irrelevant here, since
 * this page never signs anyone in; the user signs in fresh in the app) or
 * `?error=...&error_code=...&error_description=...` on failure. Supabase
 * does not emit a distinct signal for "this link was already used/already
 * confirmed" separately from "expired" or "invalid" — both surface as the
 * same generic otp_expired-style error — so that case is folded into the
 * `invalid` state's own copy rather than guessed at from text that isn't a
 * documented, stable contract.
 */
export function determineConfirmationState(params: ConfirmationPageParams): ConfirmationPageState {
  if (params.error) {
    const haystack = `${params.error_code ?? ''} ${params.error_description ?? ''}`.toLowerCase();
    if (haystack.includes('expired')) {
      return {
        status: 'expired',
        heading: 'This link has expired',
        message:
          'Confirmation links expire after a while for your security. Please return to the Bandpath IELTS app and request a new confirmation email.',
      };
    }
    return {
      status: 'invalid',
      heading: 'This link is invalid or has already been used',
      message:
        "Please return to the Bandpath IELTS app and request a new confirmation email. If you've already confirmed your account, you can sign in directly.",
    };
  }
  if (params.code) {
    return {
      status: 'success',
      heading: 'Email confirmed successfully',
      message: 'Your email has been verified. Please return to the Bandpath IELTS app and sign in.',
    };
  }
  return {
    status: 'error',
    heading: 'We couldn’t confirm this link',
    message:
      'Something unexpected happened loading this page. Please return to the Bandpath IELTS app and request a new confirmation email, or try again in a few minutes.',
  };
}
