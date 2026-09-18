import { determineConfirmationState } from '@/lib/confirmationPageState';

// Regression coverage for the release-blocking real-device bug: after
// Supabase successfully verified the email, tapping the confirmation link
// left the user on a blank white page. The fix replaces the app deep-link
// target with a static, always-rendering page (supabase/static/
// email-confirmation.html) driven entirely by this logic — these tests
// prove every reachable input combination produces real, non-empty visible
// content, so the page itself can never render blank regardless of what
// Supabase's redirect actually contains.

describe('determineConfirmationState — never returns blank content for any input', () => {
  const ALL_CASES: [string, Parameters<typeof determineConfirmationState>[0]][] = [
    ['success (code present, no error)', { code: 'a-real-pkce-code' }],
    ['expired (error_code mentions expired)', { error: 'access_denied', error_code: 'otp_expired', error_description: 'Email link is invalid or has expired' }],
    ['expired via description only', { error: 'access_denied', error_description: 'This link has expired' }],
    ['invalid/already used (generic error, no "expired")', { error: 'access_denied', error_code: 'otp_disabled', error_description: 'Email link is invalid' }],
    ['invalid (error with no description at all)', { error: 'access_denied' }],
    ['error/unexpected (no code, no error — a broken or bare redirect)', {}],
  ];

  it.each(ALL_CASES)('%s always has a non-empty heading and message', (_label, params) => {
    const state = determineConfirmationState(params);
    expect(state.heading.trim().length).toBeGreaterThan(0);
    expect(state.message.trim().length).toBeGreaterThan(0);
    expect(['success', 'expired', 'invalid', 'error']).toContain(state.status);
  });
});

describe('determineConfirmationState — exact required copy', () => {
  it('success: states the confirmation happened and to return to the app and sign in', () => {
    const state = determineConfirmationState({ code: 'xyz' });
    expect(state.status).toBe('success');
    expect(state.heading).toBe('Email confirmed successfully');
    expect(state.message).toMatch(/verified/i);
    expect(state.message).toMatch(/return to the Bandpath IELTS app and sign in/i);
  });

  it('expired: tells the user to return to the app and request a new confirmation email', () => {
    const state = determineConfirmationState({ error: 'access_denied', error_code: 'otp_expired', error_description: 'Email link is invalid or has expired' });
    expect(state.status).toBe('expired');
    expect(state.message).toMatch(/return to the Bandpath IELTS app/i);
    expect(state.message).toMatch(/request a new confirmation email/i);
  });

  it('invalid/already-used: also tells the user to return to the app and request a new confirmation email', () => {
    const state = determineConfirmationState({ error: 'access_denied', error_code: 'otp_disabled' });
    expect(state.status).toBe('invalid');
    expect(state.message).toMatch(/return to the Bandpath IELTS app/i);
    expect(state.message).toMatch(/request a new confirmation email/i);
  });

  it('a genuinely malformed/bare redirect (no code, no error) still shows actionable guidance, never nothing', () => {
    const state = determineConfirmationState({});
    expect(state.status).toBe('error');
    expect(state.message).toMatch(/return to the Bandpath IELTS app/i);
  });
});

describe('determineConfirmationState — error takes precedence over a stray code', () => {
  it('an error param always wins even if a code is somehow also present', () => {
    const state = determineConfirmationState({ code: 'stray', error: 'access_denied', error_code: 'otp_expired' });
    expect(state.status).toBe('expired');
  });
});
