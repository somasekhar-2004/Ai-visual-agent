import { supabase } from '@/lib/supabase';
import { getCurrentUserId, hasCompletedOnboarding, setOnboardingComplete } from '@/services/auth';

jest.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession: jest.fn().mockResolvedValue({ data: { session: null } }) } },
}));

describe('local onboarding-completion flag', () => {
  afterEach(() => jest.clearAllMocks());

  it('starts incomplete', async () => {
    expect(await hasCompletedOnboarding()).toBe(false);
  });

  it('persists onboarding completion', async () => {
    await setOnboardingComplete();
    expect(await hasCompletedOnboarding()).toBe(true);
  });
});

describe('getCurrentUserId — no signed-in Supabase session', () => {
  it('returns null when there is no session', async () => {
    expect(await getCurrentUserId()).toBeNull();
    expect(supabase!.auth.getSession).toHaveBeenCalled();
  });
});
