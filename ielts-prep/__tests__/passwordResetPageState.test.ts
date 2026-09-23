// Regression coverage for the FINAL AUTH RELEASE AUDIT: Forgot Password was
// landing on the signup-confirmation success page instead of a "Set new
// password" screen. Root cause (see services/auth.ts / lib/supabase.ts):
//  1. sendPasswordReset() sent no `redirectTo` at all, so Supabase fell back
//     to the project's Site URL — which had been pointed at the signup
//     confirmation page, so every recovery link opened it instead.
//  2. Even with its own redirectTo, the main app's Supabase client uses
//     PKCE, whose recovery code can only be exchanged by the exact device/
//     storage that requested it — never a page opened from an email link.
// This file covers the recovery page's own pure state logic (mirrored as
// plain JS in reset-password/index.html in the separate bandpath-public
// repo — see that file's own header comment) and the shared password
// policy. __tests__/authRealMode.test.ts covers the redirect URL/client
// choice itself.

import { determineRecoveryLinkState, MIN_PASSWORD_LENGTH, validateNewPassword } from '@/lib/passwordResetPageState';

describe('determineRecoveryLinkState', () => {
  it('is "ready" (shows the Set New Password form) once recovery tokens were found in the URL', () => {
    const state = determineRecoveryLinkState({ hasRecoveryTokens: true });
    expect(state.status).toBe('ready');
    expect(state.heading).toBe('Set a new password');
  });

  it('is "expired" for an otp_expired-style error', () => {
    const state = determineRecoveryLinkState({
      hasRecoveryTokens: false,
      error: 'access_denied',
      error_code: 'otp_expired',
      error_description: 'Email link has expired',
    });
    expect(state.status).toBe('expired');
    expect(state.heading).toBe('This link has expired');
  });

  it('is "invalid" for a used/otherwise-rejected link (Supabase has no distinct "already used" signal)', () => {
    const state = determineRecoveryLinkState({
      hasRecoveryTokens: false,
      error: 'access_denied',
      error_code: 'otp_disabled',
      error_description: 'Token has already been used',
    });
    expect(state.status).toBe('invalid');
    expect(state.heading).toMatch(/invalid or has already been used/i);
  });

  it('is "invalid" for a bare error with no code/description at all', () => {
    const state = determineRecoveryLinkState({ hasRecoveryTokens: false, error: 'access_denied' });
    expect(state.status).toBe('invalid');
  });

  it('is "error" (never blank) when the page loads with neither tokens nor an error param', () => {
    const state = determineRecoveryLinkState({ hasRecoveryTokens: false });
    expect(state.status).toBe('error');
    expect(state.heading.length).toBeGreaterThan(0);
    expect(state.message.length).toBeGreaterThan(0);
  });

  it('never renders the signup-confirmation page\'s success heading', () => {
    const state = determineRecoveryLinkState({ hasRecoveryTokens: true });
    expect(state.heading).not.toMatch(/email confirmed/i);
  });
});

describe('validateNewPassword', () => {
  it(`rejects a password shorter than ${MIN_PASSWORD_LENGTH} characters`, () => {
    const result = validateNewPassword('short1', 'short1');
    expect(result).toEqual({ ok: false, error: 'too_short', message: expect.stringContaining(String(MIN_PASSWORD_LENGTH)) });
  });

  it('rejects a mismatched confirmation', () => {
    const result = validateNewPassword('longenough1', 'longenough2');
    expect(result).toEqual({ ok: false, error: 'mismatch', message: 'Passwords do not match.' });
  });

  it('reports too_short rather than mismatch when both fields are short and different', () => {
    const result = validateNewPassword('ab', 'cd');
    expect(result).toEqual({ ok: false, error: 'too_short', message: expect.any(String) });
  });

  it('accepts a long-enough, matching password pair', () => {
    expect(validateNewPassword('longenough1', 'longenough1')).toEqual({ ok: true });
  });
});
