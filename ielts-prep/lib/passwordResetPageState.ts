/**
 * Canonical state logic for the password-recovery page — served from
 * GitHub Pages at https://somasekhar-2004.github.io/bandpath-public/reset-password/
 * (source: reset-password/index.html in the separate github.com/
 * somasekhar-2004/bandpath-public repo). NOT part of this app's bundle, and
 * deliberately a completely separate page from the signup-confirmation
 * landing page (lib/confirmationPageState.ts) — see services/auth.ts's
 * PASSWORD_RESET_REDIRECT_URL for why the two must never share a URL.
 *
 * Unlike signup confirmation (where the confirmation already happened
 * server-side before the page even loads, and the page only ever displays
 * a message), this page has real work left to do: it must establish a
 * session from the recovery link's tokens and call
 * `supabase.auth.updateUser({ password })`. This file is the tested source
 * of truth for the pure, non-network parts of that: which state the page is
 * in given its URL, and whether a submitted password is acceptable. The
 * bandpath-public repo's reset-password/index.html mirrors both functions
 * in plain inline JS (that repo has no build step) — keep both in sync if
 * either changes.
 */

export type RecoveryLinkStatus = 'ready' | 'expired' | 'invalid' | 'error';

export type RecoveryLinkParams = {
  /** True once a real session has been (or is being) established from the
   * link's own implicit-flow tokens — i.e. `access_token` was present in
   * the URL fragment. This page never inspects the tokens themselves; it
   * only needs to know whether the SDK found something to work with. */
  hasRecoveryTokens: boolean;
  error?: string | null;
  error_code?: string | null;
  error_description?: string | null;
};

export type RecoveryLinkState = {
  status: RecoveryLinkStatus;
  heading: string;
  message: string;
};

/**
 * Supabase's recovery redirect appends the same error shape signup
 * confirmation does (`?error=...&error_code=...&error_description=...`) for
 * an expired, invalid, or already-used link — GoTrue does not emit a
 * distinct signal for "already used" separately from "expired"/"invalid",
 * so (exactly like confirmationPageState.ts) that case is folded into the
 * `invalid` state's own copy rather than guessed at from message text that
 * isn't a documented, stable contract. A successful link instead carries
 * `#access_token=...&refresh_token=...&type=recovery` in the URL fragment —
 * this function never reads those tokens itself (that's the SDK's job); it
 * only needs to know one arrived.
 */
export function determineRecoveryLinkState(params: RecoveryLinkParams): RecoveryLinkState {
  if (params.error) {
    const haystack = `${params.error_code ?? ''} ${params.error_description ?? ''}`.toLowerCase();
    if (haystack.includes('expired')) {
      return {
        status: 'expired',
        heading: 'This link has expired',
        message: 'Password reset links expire after a while for your security. Please return to the Bandpath IELTS app and request a new one from "Forgot password?".',
      };
    }
    return {
      status: 'invalid',
      heading: 'This link is invalid or has already been used',
      message: 'Please return to the Bandpath IELTS app and request a new password reset link from "Forgot password?".',
    };
  }
  if (params.hasRecoveryTokens) {
    return {
      status: 'ready',
      heading: 'Set a new password',
      message: '',
    };
  }
  return {
    status: 'error',
    heading: 'We couldn’t verify this link',
    message: 'Something unexpected happened loading this page. Please return to the Bandpath IELTS app and request a new password reset link, or try again in a few minutes.',
  };
}

/** The app's existing password policy (see app/(auth)/sign-up.tsx's
 * "At least 8 characters" hint) — kept as the one source of truth so the
 * recovery page enforces the exact same minimum, not a second guessed-at
 * number. */
export const MIN_PASSWORD_LENGTH = 8;

export type PasswordValidationError = 'too_short' | 'mismatch';

export type PasswordValidationResult = { ok: true } | { ok: false; error: PasswordValidationError; message: string };

/** Validates a new-password + confirm-password pair for the recovery form.
 * Length is checked before match so a too-short password is never reported
 * as a "mismatch" just because the confirm field is also short. */
export function validateNewPassword(password: string, confirmPassword: string): PasswordValidationResult {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: 'too_short', message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (password !== confirmPassword) {
    return { ok: false, error: 'mismatch', message: 'Passwords do not match.' };
  }
  return { ok: true };
}
