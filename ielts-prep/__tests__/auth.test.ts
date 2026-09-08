import { DEMO_USER_ID } from '@/lib/demoStore';
import { getCurrentUserId, hasCompletedOnboarding, setOnboardingComplete, signInDemo, signOut } from '@/services/auth';

describe('demo-mode auth', () => {
  it('starts signed out with onboarding incomplete', async () => {
    expect(await getCurrentUserId()).toBeNull();
    expect(await hasCompletedOnboarding()).toBe(false);
  });

  it('signs in and out of demo mode', async () => {
    const result = await signInDemo();
    expect('userId' in result && result.userId).toBe(DEMO_USER_ID);
    expect(await getCurrentUserId()).toBe(DEMO_USER_ID);

    await signOut();
    expect(await getCurrentUserId()).toBeNull();
  });

  it('persists onboarding completion', async () => {
    await setOnboardingComplete();
    expect(await hasCompletedOnboarding()).toBe(true);
  });
});
