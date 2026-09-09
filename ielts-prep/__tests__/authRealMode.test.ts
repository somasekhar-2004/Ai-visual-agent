import { supabase } from '@/lib/supabase';
import { signUpWithEmail } from '@/services/auth';

// These tests exercise the real-backend branch of services/auth.ts, so
// isDemoMode must be false here (unlike the rest of the suite, which runs
// with no EXPO_PUBLIC_SUPABASE_URL set and therefore stays in Demo Mode).
jest.mock('@/lib/env', () => ({
  ...jest.requireActual('@/lib/env'),
  isDemoMode: false,
  isSupabaseConfigured: true,
}));

jest.mock('@/lib/supabase', () => ({
  supabase: { auth: { signUp: jest.fn() } },
}));

const signUpMock = (supabase as unknown as { auth: { signUp: jest.Mock } }).auth.signUp;

describe('signUpWithEmail — real backend', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns a userId when sign-up starts a session immediately (email confirmation off)', async () => {
    signUpMock.mockResolvedValue({
      data: { user: { id: 'user-1' }, session: { access_token: 'jwt' } },
      error: null,
    });
    const result = await signUpWithEmail('a@b.com', 'password123', 'Alex');
    expect(result).toEqual({ userId: 'user-1' });
  });

  it('surfaces a clear message instead of a userId when the project requires email confirmation (no session yet)', async () => {
    // This is the exact shape supabase-js returns for signUp() on a project
    // with email confirmation required: a user row exists, but no session,
    // so auth.uid() is null for any request the client makes right after.
    // Regression test for the crash this used to cause: the caller treated
    // this as "signed in" and immediately wrote to an RLS-protected table
    // (user_goals) with no authenticated session, which failed and reached
    // saveOnboardingGoal/mapGoalRow with a null row.
    signUpMock.mockResolvedValue({
      data: { user: { id: 'user-1' }, session: null },
      error: null,
    });
    const result = await signUpWithEmail('a@b.com', 'password123', 'Alex');
    expect('userId' in result).toBe(false);
    expect('error' in result && result.error).toMatch(/confirm/i);
  });

  it('still surfaces the Supabase auth error message when sign-up itself fails', async () => {
    signUpMock.mockResolvedValue({ data: { user: null, session: null }, error: { message: 'User already registered' } });
    const result = await signUpWithEmail('a@b.com', 'password123', 'Alex');
    expect(result).toEqual({ error: 'User already registered' });
  });
});
