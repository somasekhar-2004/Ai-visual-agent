import { supabase } from '@/lib/supabase';
import { exchangeConfirmationCode, resendConfirmationEmail, signInWithEmail, signUpWithEmail } from '@/services/auth';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { signUp: jest.fn(), signInWithPassword: jest.fn(), resend: jest.fn(), exchangeCodeForSession: jest.fn() },
  },
}));

const auth = (
  supabase as unknown as {
    auth: { signUp: jest.Mock; signInWithPassword: jest.Mock; resend: jest.Mock; exchangeCodeForSession: jest.Mock };
  }
).auth;

describe('signUpWithEmail — real backend', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns a userId when sign-up starts a session immediately (email confirmation off)', async () => {
    auth.signUp.mockResolvedValue({
      data: { user: { id: 'user-1', identities: [{ id: 'identity-1' }] }, session: { access_token: 'jwt' } },
      error: null,
    });
    const result = await signUpWithEmail('a@b.com', 'password123', 'Alex');
    expect(result).toEqual({ userId: 'user-1' });
  });

  // Same regression as resendConfirmationEmail's "never localhost" test
  // below — this is the redirect the very first confirmation email uses.
  it('signs up with a non-localhost, GitHub Pages emailRedirectTo', async () => {
    auth.signUp.mockResolvedValue({
      data: { user: { id: 'user-1', identities: [{ id: 'identity-1' }] }, session: null },
      error: null,
    });
    await signUpWithEmail('a@b.com', 'password123', 'Alex');
    const sentOptions = auth.signUp.mock.calls[0][0].options;
    expect(sentOptions.emailRedirectTo).not.toMatch(/localhost/i);
    expect(sentOptions.emailRedirectTo).toBe('https://somasekhar-2004.github.io/bandpath-public/');
  });

  it('returns pendingConfirmation instead of a userId when the project requires email confirmation (no session yet)', async () => {
    // This is the exact shape supabase-js returns for signUp() on a project
    // with email confirmation required: a user row exists, but no session,
    // so auth.uid() is null for any request the client makes right after.
    // Regression test for the crash this used to cause: the caller treated
    // this as "signed in" and immediately wrote to an RLS-protected table
    // (user_goals) with no authenticated session, which failed and reached
    // saveOnboardingGoal/mapGoalRow with a null row.
    auth.signUp.mockResolvedValue({
      data: { user: { id: 'user-1', identities: [{ id: 'identity-1' }] }, session: null },
      error: null,
    });
    const result = await signUpWithEmail('a@b.com', 'password123', 'Alex');
    expect(result).toEqual({ pendingConfirmation: true, email: 'a@b.com' });
  });

  it('still surfaces the Supabase auth error message when sign-up itself fails for an unmapped reason', async () => {
    auth.signUp.mockResolvedValue({ data: { user: null, session: null }, error: { message: 'Password should be at least 6 characters.' } });
    const result = await signUpWithEmail('a@b.com', 'password123', 'Alex');
    expect(result).toEqual({ error: 'Password should be at least 6 characters.' });
  });

  it('maps the over_email_send_rate_limit error code to a clear, actionable message', async () => {
    auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: 'over_email_send_rate_limit', message: 'Email rate limit exceeded' },
    });
    const result = await signUpWithEmail('a@b.com', 'password123', 'Alex');
    expect('error' in result && result.error).toMatch(/too many emails/i);
  });

  describe('an email that already has an account (identities: [], or an explicit already-exists error)', () => {
    // Regression coverage for the reported bug: signUp() returns this same
    // ambiguous "success, empty identities" shape (per a Supabase maintainer,
    // the old identities-length-only heuristic "has changed since" it was
    // first documented) for BOTH a confirmed AND an unconfirmed existing
    // account — so confirmed must never be inferred from that shape alone.
    // The fix disambiguates via a real auth.resend() call.

    it('identities: [] + resend succeeds → pendingConfirmation (the account was actually UNCONFIRMED)', async () => {
      auth.signUp.mockResolvedValue({ data: { user: { id: 'user-1', identities: [] }, session: null }, error: null });
      auth.resend.mockResolvedValue({ error: null });
      const result = await signUpWithEmail('a@b.com', 'password123', 'Alex');
      expect(result).toEqual({ pendingConfirmation: true, email: 'a@b.com', alreadyRegistered: true });
      expect(auth.resend).toHaveBeenCalledWith(expect.objectContaining({ type: 'signup', email: 'a@b.com' }));
    });

    it('identities: [] + resend fails (not rate-limited) → existingConfirmedAccount (nothing left to resend)', async () => {
      auth.signUp.mockResolvedValue({ data: { user: { id: 'user-1', identities: [] }, session: null }, error: null });
      auth.resend.mockResolvedValue({ error: { code: 'validation_failed', message: 'Email already confirmed' } });
      const result = await signUpWithEmail('a@b.com', 'password123', 'Alex');
      expect(result).toEqual({ existingConfirmedAccount: true, email: 'a@b.com' });
    });

    it('identities: [] + resend is rate-limited → a plain rate-limit error, not a confirmed/unconfirmed guess', async () => {
      auth.signUp.mockResolvedValue({ data: { user: { id: 'user-1', identities: [] }, session: null }, error: null });
      auth.resend.mockResolvedValue({ error: { code: 'over_email_send_rate_limit', message: 'you can only request this after 30 seconds' } });
      const result = await signUpWithEmail('a@b.com', 'password123', 'Alex');
      expect('retryAfterSeconds' in result && result.retryAfterSeconds).toBe(30);
      expect('existingConfirmedAccount' in result).toBe(false);
      expect('pendingConfirmation' in result).toBe(false);
    });

    it('an explicit user_already_exists signUp error is disambiguated the same way (resend succeeds → pendingConfirmation)', async () => {
      auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { code: 'user_already_exists', message: 'User already registered' },
      });
      auth.resend.mockResolvedValue({ error: null });
      const result = await signUpWithEmail('a@b.com', 'password123', 'Alex');
      expect(result).toEqual({ pendingConfirmation: true, email: 'a@b.com', alreadyRegistered: true });
    });
  });
});

describe('signInWithEmail — real backend', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns pendingConfirmation (not a plain error) when the account has not confirmed its email yet', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: 'email_not_confirmed', message: 'Email not confirmed' },
    });
    const result = await signInWithEmail('a@b.com', 'password123');
    expect(result).toEqual({ pendingConfirmation: true, email: 'a@b.com' });
  });

  it('returns a userId on a normal successful sign-in', async () => {
    auth.signInWithPassword.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    const result = await signInWithEmail('a@b.com', 'password123');
    expect(result).toEqual({ userId: 'user-1' });
  });
});

describe('resendConfirmationEmail — real backend', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns ok on a successful resend, using auth.resend (not signUp again)', async () => {
    auth.resend.mockResolvedValue({ error: null });
    const result = await resendConfirmationEmail('a@b.com');
    expect(result).toEqual({ ok: true });
    expect(auth.resend).toHaveBeenCalledWith({ type: 'signup', email: 'a@b.com', options: expect.objectContaining({ emailRedirectTo: expect.any(String) }) });
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  // Regression coverage for the release-blocking real-device bug: the
  // confirmation email pointed at localhost:3000 because Supabase's
  // Redirect URLs allowlist (a Dashboard setting) didn't include the app's
  // redirect URL, so Supabase silently used its default Site URL instead.
  // This test guards the app-side half of that fix: the value actually
  // sent must never be a localhost URL and must be the real GitHub Pages
  // confirmation page — see services/auth.ts's
  // EMAIL_CONFIRMATION_REDIRECT_URL comment for the Dashboard-side half,
  // which no app code change can fix.
  it('never sends a localhost redirectTo — always the GitHub Pages confirmation page', async () => {
    auth.resend.mockResolvedValue({ error: null });
    await resendConfirmationEmail('a@b.com');
    const sentOptions = auth.resend.mock.calls[0][0].options;
    expect(sentOptions.emailRedirectTo).not.toMatch(/localhost/i);
    expect(sentOptions.emailRedirectTo).toBe('https://somasekhar-2004.github.io/bandpath-public/');
  });

  it('surfaces a clear, generic message when rate-limited with no parseable wait time', async () => {
    auth.resend.mockResolvedValue({ error: { code: 'over_email_send_rate_limit', message: 'Email rate limit exceeded' } });
    const result = await resendConfirmationEmail('a@b.com');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/too many emails/i);
    expect(result.retryAfterSeconds).toBeUndefined();
  });

  it('surfaces the exact countdown when Supabase reports a specific wait time', async () => {
    auth.resend.mockResolvedValue({
      error: { code: 'over_email_send_rate_limit', message: 'For security purposes, you can only request this after 42 seconds.' },
    });
    const result = await resendConfirmationEmail('a@b.com');
    expect(result.ok).toBe(false);
    expect(result.retryAfterSeconds).toBe(42);
    expect(result.error).toBe('Please wait 42 seconds before requesting another email.');
  });

  it('surfaces a plain error (e.g. "already confirmed") rather than a raw Supabase code', async () => {
    auth.resend.mockResolvedValue({ error: { code: 'validation_failed', message: 'Email already confirmed' } });
    const result = await resendConfirmationEmail('a@b.com');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Email already confirmed');
  });

  // Regression coverage: every other Supabase call in services/auth.ts
  // returns { error } rather than throwing, but auth.resend()'s underlying
  // fetch can reject outright on a genuine network failure (no
  // connectivity, DNS failure). Before this fix that unhandled rejection
  // left components/auth/ResendConfirmationNotice.tsx's button stuck
  // showing "Sending…" forever with no error and no way to retry.
  it('never throws on a network failure — resolves { ok: false } instead', async () => {
    auth.resend.mockRejectedValue(new Error('Network request failed'));
    await expect(resendConfirmationEmail('a@b.com')).resolves.toEqual({ ok: false, error: 'Network request failed' });
  });
});

describe('exchangeConfirmationCode — real backend', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns ok on a successful confirmation redirect', async () => {
    auth.exchangeCodeForSession.mockResolvedValue({ data: { session: { access_token: 'jwt' } }, error: null });
    const result = await exchangeConfirmationCode('valid-code');
    expect(result).toEqual({ ok: true });
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith('valid-code');
  });

  it('surfaces an error for an invalid or expired confirmation link', async () => {
    auth.exchangeCodeForSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Email link is invalid or has expired', code: 'otp_expired' },
    });
    const result = await exchangeConfirmationCode('expired-code');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/invalid or has expired/i);
  });
});
