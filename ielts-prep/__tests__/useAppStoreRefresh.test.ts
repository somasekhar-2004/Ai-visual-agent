// Regression coverage for the Home white-screen investigation: Home used to
// render `null` whenever `goal` was falsy, and refreshUserData's
// Promise.all meant a single failing query (e.g. one table hitting a
// permission error) wiped out every other field too, since Promise.all
// rejects — and resolves nothing — as soon as any one promise rejects.
// These tests mock @/services/repository directly (not Supabase) since the
// store calls those functions by name.

import { getActiveGoal, getLatestBandScores, getProfile, getStreak, getSubscription, getXp } from '@/services/repository';
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
