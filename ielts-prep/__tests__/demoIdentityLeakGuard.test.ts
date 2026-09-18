// Regression coverage for the exact root cause of the reported "Demo data
// leaking into a real session" incident's onboarding half: services/auth.ts's
// signInDemo() used to return the hardcoded DEMO_USER_ID unconditionally —
// with no isDemoMode check at all, unlike every other function in that
// file — so any caller with a bug (completeOnboarding()'s "no userId yet,
// fall back to demo" branch, meant only for the genuine Demo Mode path)
// could silently attach a real user's data to that hardcoded id instead of
// failing loudly. These tests prove that guard, and that
// completeOnboarding() never uses it as a substitute for a real signed-in
// user once a real backend is configured.

import { DEMO_USER_ID } from '@/lib/demoStore';

describe('signInDemo — refuses to run once a real backend is configured', () => {
  afterEach(() => jest.resetModules());

  it('returns the demo user id when Supabase is not configured (the genuine Demo Mode path)', async () => {
    jest.resetModules();
    jest.doMock('@/lib/env', () => ({ isDemoMode: true }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { signInDemo } = require('@/services/auth') as typeof import('@/services/auth');
    const result = await signInDemo();
    expect(result).toEqual({ userId: DEMO_USER_ID });
  });

  it('refuses and never returns DEMO_USER_ID once a real backend is configured', async () => {
    jest.resetModules();
    jest.doMock('@/lib/env', () => ({ isDemoMode: false }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { signInDemo } = require('@/services/auth') as typeof import('@/services/auth');
    const result = await signInDemo();
    expect('error' in result).toBe(true);
    expect(JSON.stringify(result)).not.toContain(DEMO_USER_ID);
  });
});

describe('completeOnboarding — never falls back to a demo identity for a real backend', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterEach(() => jest.dontMock('@/services/auth'));

  const ONBOARDING_INPUT = {
    ieltsType: 'academic' as const,
    currentBand: 6,
    targetBand: 7,
    examDate: null,
    weakestSkill: null,
    dailyStudyMinutes: 30,
  };

  async function setupStore(opts: { signInDemoResult: unknown }) {
    const mockSignInDemo = jest.fn().mockResolvedValue(opts.signInDemoResult);
    jest.doMock('@/services/auth', () => ({
      getCurrentUserId: jest.fn().mockResolvedValue(null),
      hasCompletedOnboarding: jest.fn().mockResolvedValue(false),
      setOnboardingComplete: jest.fn(),
      signInDemo: mockSignInDemo,
      signOut: jest.fn(),
    }));
    const mockSaveOnboardingGoal = jest.fn();
    jest.doMock('@/services/repository', () => ({
      getProfile: jest.fn(),
      getActiveGoal: jest.fn(),
      getLatestBandScores: jest.fn(),
      getSubscription: jest.fn(),
      getStreak: jest.fn(),
      getXp: jest.fn(),
      saveOnboardingGoal: mockSaveOnboardingGoal,
      setNotificationPref: jest.fn(),
      syncSubscriptionEntitlement: jest.fn().mockResolvedValue(undefined),
    }));
    jest.doMock('@/services/notifications', () => ({ applyNotificationPreferences: jest.fn() }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAppStore } = require('@/store/useAppStore') as typeof import('@/store/useAppStore');
    return { useAppStore, mockSignInDemo, mockSaveOnboardingGoal };
  }

  it('with no signed-in user and a real backend (signInDemo refuses), completeOnboarding throws instead of silently saving under a demo identity', async () => {
    const { useAppStore, mockSaveOnboardingGoal } = await setupStore({
      signInDemoResult: { error: 'Demo Mode is not available — this build is configured with a real backend.' },
    });
    useAppStore.setState({ userId: null });

    await expect(useAppStore.getState().completeOnboarding(ONBOARDING_INPUT)).rejects.toThrow(
      'No signed-in user to attach onboarding data to.'
    );
    expect(mockSaveOnboardingGoal).not.toHaveBeenCalled();
  });

  it('with a real userId already in the store, completeOnboarding uses it directly and never calls signInDemo at all', async () => {
    const { useAppStore, mockSignInDemo, mockSaveOnboardingGoal } = await setupStore({
      signInDemoResult: { userId: DEMO_USER_ID },
    });
    mockSaveOnboardingGoal.mockResolvedValue({
      id: 'goal-1',
      userId: 'real-user-A',
      ieltsType: 'academic',
      currentBand: 6,
      targetBand: 7,
      examDate: null,
      weakestSkill: null,
      dailyStudyMinutes: 30,
      isActive: true,
      createdAt: '2026-01-01',
    });
    useAppStore.setState({ userId: 'real-user-A' });

    await useAppStore.getState().completeOnboarding(ONBOARDING_INPUT);

    expect(mockSignInDemo).not.toHaveBeenCalled();
    expect(mockSaveOnboardingGoal).toHaveBeenCalledWith('real-user-A', expect.anything());
  });

  it('two different real accounts on the same device never collide through the demo fallback — each saves under its own id', async () => {
    const { useAppStore, mockSaveOnboardingGoal } = await setupStore({
      signInDemoResult: { userId: DEMO_USER_ID },
    });
    mockSaveOnboardingGoal.mockImplementation((userId: string) => Promise.resolve({
      id: `goal-${userId}`,
      userId,
      ieltsType: 'academic',
      currentBand: 6,
      targetBand: 7,
      examDate: null,
      weakestSkill: null,
      dailyStudyMinutes: 30,
      isActive: true,
      createdAt: '2026-01-01',
    }));

    useAppStore.setState({ userId: 'account-1' });
    await useAppStore.getState().completeOnboarding(ONBOARDING_INPUT);

    useAppStore.setState({ userId: 'account-2' });
    await useAppStore.getState().completeOnboarding(ONBOARDING_INPUT);

    expect(mockSaveOnboardingGoal).toHaveBeenNthCalledWith(1, 'account-1', expect.anything());
    expect(mockSaveOnboardingGoal).toHaveBeenNthCalledWith(2, 'account-2', expect.anything());
    const calledIds = mockSaveOnboardingGoal.mock.calls.map((call: unknown[]) => call[0]);
    expect(calledIds).not.toContain(DEMO_USER_ID);
  });
});
