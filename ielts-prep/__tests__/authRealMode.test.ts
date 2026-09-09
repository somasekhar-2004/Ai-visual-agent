import { supabase } from '@/lib/supabase';
import { resendConfirmationEmail, signInWithEmail, signUpWithEmail } from '@/services/auth';

// These tests exercise the real-backend branch of services/auth.ts, so
// isDemoMode must be false here (unlike the rest of the suite, which runs
// with no EXPO_PUBLIC_SUPABASE_URL set and therefore stays in Demo Mode).
jest.mock('@/lib/env', () => ({
  ...jest.requireActual('@/lib/env'),
  isDemoMode: false,
  isSupabaseConfigured: true,
}));

jest.mock('@/lib/supabase', () => ({
  supabase: { auth: { signUp: jest.fn(), signInWithPassword: jest.fn(), resend: jest.fn() } },
}));

const auth = (supabase as unknown as { auth: { signUp: jest.Mock; signInWithPassword: jest.Mock; resend: jest.Mock } }).auth;

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

  it('treats an empty identities array (anti-enumeration signal) as an already-confirmed duplicate, not pendingConfirmation', async () => {
    // Supabase returns this shape (success, no error) when signUp() is called
    // with an email that already belongs to a CONFIRMED account, to avoid
    // leaking which emails are registered. Regression test: this must not be
    // read as "new pending signup" and silently resend nothing useful.
    auth.signUp.mockResolvedValue({
      data: { user: { id: 'user-1', identities: [] }, session: null },
      error: null,
    });
    const result = await signUpWithEmail('a@b.com', 'password123', 'Alex');
    expect('error' in result && result.error).toMatch(/already exists/i);
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

  it('maps the user_already_exists error code to a sign-in prompt', async () => {
    auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: 'user_already_exists', message: 'User already registered' },
    });
    const result = await signUpWithEmail('a@b.com', 'password123', 'Alex');
    expect('error' in result && result.error).toMatch(/sign in instead/i);
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

  it('returns ok on a successful resend', async () => {
    auth.resend.mockResolvedValue({ error: null });
    const result = await resendConfirmationEmail('a@b.com');
    expect(result).toEqual({ ok: true });
    expect(auth.resend).toHaveBeenCalledWith({ type: 'signup', email: 'a@b.com' });
  });

  it('surfaces a clear message when the resend is rate-limited', async () => {
    auth.resend.mockResolvedValue({ error: { code: 'over_email_send_rate_limit', message: 'Email rate limit exceeded' } });
    const result = await resendConfirmationEmail('a@b.com');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/too many emails/i);
  });
});
