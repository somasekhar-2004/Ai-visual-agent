// Regression coverage for the Home white-screen investigation: Home used to
// render `null` whenever `goal` was falsy, and refreshUserData's
// Promise.all meant a single failing query (e.g. one table hitting a
// permission error) wiped out every other field too, since Promise.all
// rejects — and resolves nothing — as soon as any one promise rejects.
// These tests mock @/services/repository directly (not Supabase) since the
// store calls those functions by name.

import { getActiveGoal, getLatestBandScores, getProfile, getStreak, getSubscription, getXp, saveOnboardingGoal } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

jest.mock('@/services/auth', () => ({
  getCurrentUserId: jest.fn().mockResolvedValue('user-1'),
  hasCompletedOnboarding: jest.fn().mockResolvedValue(true),
  setOnboardingComplete: jest.fn(),
  signInDemo: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('@/services/repository', () => ({
  getProfile: jest.fn(),
  getActiveGoal: jest.fn(),
  getLatestBandScores: jest.fn(),
  getSubscription: jest.fn(),
  getStreak: jest.fn(),
  getXp: jest.fn(),
  refreshOverallBand: jest.fn(),
  saveOnboardingGoal: jest.fn(),
  syncSubscriptionEntitlement: jest.fn().mockResolvedValue(undefined),
}));

const mockGetProfile = getProfile as jest.Mock;
const mockGetActiveGoal = getActiveGoal as jest.Mock;
const mockGetLatestBandScores = getLatestBandScores as jest.Mock;
const mockGetSubscription = getSubscription as jest.Mock;
const mockGetStreak = getStreak as jest.Mock;
const mockGetXp = getXp as jest.Mock;
const mockSaveOnboardingGoal = saveOnboardingGoal as jest.Mock;

const PROFILE = { id: 'user-1', fullName: 'Alex', avatarUrl: null, createdAt: '2026-01-01' };
const GOAL = {
  id: 'goal-1',
  userId: 'user-1',
  ieltsType: 'academic' as const,
  currentBand: 6,
  targetBand: 7,
  examDate: null,
  weakestSkill: null,
  dailyStudyMinutes: 30,
  isActive: true,
  createdAt: '2026-01-01',
};

function resetStore() {
  useAppStore.setState({
    isHydrated: false,
    userId: null,
    onboardingComplete: false,
    profile: null,
    goal: null,
    bandScores: {},
    subscription: null,
    streak: { count: 0, lastActiveDate: null },
    xp: 0,
    homeError: null,
  });
}

describe('refreshUserData — partial-failure resilience', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
  });

  it('a single failing query does not wipe out the others\' successful results', async () => {
    mockGetProfile.mockResolvedValue(PROFILE);
    mockGetActiveGoal.mockRejectedValue(new Error('permission denied for table user_goals'));
    mockGetLatestBandScores.mockResolvedValue({ overall: 6.5 });
    mockGetSubscription.mockResolvedValue(null);
    mockGetStreak.mockResolvedValue({ count: 3, lastActiveDate: '2026-01-01' });
    mockGetXp.mockResolvedValue(120);

    await useAppStore.getState().refreshUserData('user-1');

    const state = useAppStore.getState();
    // The failing query's field is untouched (stays at its previous value)
    // rather than the whole screen losing every other field too.
    expect(state.goal).toBeNull();
    expect(state.profile).toEqual(PROFILE);
    expect(state.bandScores).toEqual({ overall: 6.5 });
    expect(state.streak).toEqual({ count: 3, lastActiveDate: '2026-01-01' });
    expect(state.xp).toBe(120);
    expect(state.homeError).toMatch(/permission denied for table user_goals/);
  });

  it('clears homeError on a fully successful refresh after a previous failure', async () => {
    useAppStore.setState({ homeError: 'a previous failure' });
    mockGetProfile.mockResolvedValue(PROFILE);
    mockGetActiveGoal.mockResolvedValue(GOAL);
    mockGetLatestBandScores.mockResolvedValue({});
    mockGetSubscription.mockResolvedValue(null);
    mockGetStreak.mockResolvedValue({ count: 0, lastActiveDate: null });
    mockGetXp.mockResolvedValue(0);

    await useAppStore.getState().refreshUserData('user-1');

    expect(useAppStore.getState().homeError).toBeNull();
    expect(useAppStore.getState().goal).toEqual(GOAL);
  });
});

// Regression coverage for the "Home keeps showing 'Let's set up your study
// goal' even though I already completed goal setup" bug: root cause was
// app/confirm.tsx (the email-confirmation deep-link screen) never calling
// completeOnboarding at all, so a user who had to confirm their email
// before their first session never got a user_goals row saved — the
// wizard's answers were silently discarded. These tests exercise the same
// store-level sequence confirm.tsx now runs (hydrate, then
// completeOnboarding, then a later reopen), rather than rendering the
// screen itself.
describe('completeOnboarding — the goal actually saves and Home actually sees it', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
    useAppStore.setState({ userId: 'user-1' });
  });

  it('saves the goal and the store reflects it immediately after (goal saves successfully + refresh retrieves it)', async () => {
    mockSaveOnboardingGoal.mockResolvedValue(GOAL);
    mockGetProfile.mockResolvedValue(PROFILE);
    mockGetActiveGoal.mockResolvedValue(GOAL);
    mockGetLatestBandScores.mockResolvedValue({});
    mockGetSubscription.mockResolvedValue(null);
    mockGetStreak.mockResolvedValue({ count: 0, lastActiveDate: null });
    mockGetXp.mockResolvedValue(0);

    await useAppStore.getState().completeOnboarding({
      ieltsType: 'academic',
      currentBand: 6,
      targetBand: 7,
      examDate: null,
      weakestSkill: null,
      dailyStudyMinutes: 30,
    });

    expect(mockSaveOnboardingGoal).toHaveBeenCalledWith('user-1', expect.objectContaining({ ieltsType: 'academic', targetBand: 7 }));
    expect(useAppStore.getState().goal).toEqual(GOAL);
    expect(useAppStore.getState().onboardingComplete).toBe(true);
  });

  it('reopening the app afterwards (a fresh hydrate) still shows the same goal', async () => {
    mockSaveOnboardingGoal.mockResolvedValue(GOAL);
    mockGetProfile.mockResolvedValue(PROFILE);
    mockGetActiveGoal.mockResolvedValue(GOAL);
    mockGetLatestBandScores.mockResolvedValue({});
    mockGetSubscription.mockResolvedValue(null);
    mockGetStreak.mockResolvedValue({ count: 0, lastActiveDate: null });
    mockGetXp.mockResolvedValue(0);

    await useAppStore.getState().completeOnboarding({
      ieltsType: 'academic',
      currentBand: 6,
      targetBand: 7,
      examDate: null,
      weakestSkill: null,
      dailyStudyMinutes: 30,
    });

    // Simulate the app being fully closed and reopened: reset every field
    // hydrate() would repopulate, but keep hasCompletedOnboarding/
    // getCurrentUserId mocked as already-confirmed (jest.mock at the top of
    // this file resolves them to 'user-1'/true, matching a real returning
    // session).
    useAppStore.setState({ isHydrated: false, profile: null, goal: null, bandScores: {}, subscription: null, streak: { count: 0, lastActiveDate: null }, xp: 0 });

    await useAppStore.getState().hydrate();

    expect(useAppStore.getState().goal).toEqual(GOAL);
    expect(useAppStore.getState().homeError).toBeNull();
  });
});
