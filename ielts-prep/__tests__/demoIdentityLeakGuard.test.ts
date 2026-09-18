// Regression coverage for account isolation in useAppStore.completeOnboarding:
// there is no Demo Mode / fallback identity anywhere in runtime code any
// more (see lib/env.ts) — completeOnboarding must throw when there is no
// signed-in user rather than silently attaching onboarding data to any
// substitute identity, and two different real accounts on the same device
// must always save under their own separate ids.

describe('completeOnboarding — never falls back to any substitute identity', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const ONBOARDING_INPUT = {
    ieltsType: 'academic' as const,
    currentBand: 6,
    targetBand: 7,
    examDate: null,
    weakestSkill: null,
    dailyStudyMinutes: 30,
  };

  async function setupStore() {
    jest.doMock('@/services/auth', () => ({
      getCurrentUserId: jest.fn().mockResolvedValue(null),
      hasCompletedOnboarding: jest.fn().mockResolvedValue(false),
      setOnboardingComplete: jest.fn(),
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
    return { useAppStore, mockSaveOnboardingGoal };
  }

  it('with no signed-in user, completeOnboarding throws instead of saving under any substitute identity', async () => {
    const { useAppStore, mockSaveOnboardingGoal } = await setupStore();
    useAppStore.setState({ userId: null });

    await expect(useAppStore.getState().completeOnboarding(ONBOARDING_INPUT)).rejects.toThrow(
      'No signed-in user to attach onboarding data to.'
    );
    expect(mockSaveOnboardingGoal).not.toHaveBeenCalled();
  });

  it('with a real userId already in the store, completeOnboarding uses it directly', async () => {
    const { useAppStore, mockSaveOnboardingGoal } = await setupStore();
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

    expect(mockSaveOnboardingGoal).toHaveBeenCalledWith('real-user-A', expect.anything());
  });

  it('two different real accounts on the same device always save under their own separate id — never collide', async () => {
    const { useAppStore, mockSaveOnboardingGoal } = await setupStore();
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
  });
});
