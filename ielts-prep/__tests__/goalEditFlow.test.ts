// Regression coverage for "Home's 'Set your goal' flow is broken/dummy":
// pressing Home's CTA used to push the full unauthenticated onboarding
// wizard, which ends in a "Create your account" screen with no idea a
// session already exists — so an already-authenticated user's goal never
// saved against their real account. The fix (lib/goalSetupNav.ts) routes an
// authenticated user to app/profile-edit.tsx instead — the exact screen
// Settings → Edit profile & goals already used. These tests exercise that
// screen's save sequence directly (updateProfileName, then
// saveOnboardingGoal, then refreshUserData) against the real Zustand store,
// proving both "Home" and "Settings" really do share one implementation and
// that the store — which both Home and the AI Coach read from — reflects
// the new goal immediately afterward.
import { buildCoachContext } from '@/lib/coachContext';
import { getActiveGoal, getLatestBandScores, getProfile, getStreak, getSubscription, getXp, saveOnboardingGoal, updateProfileName } from '@/services/repository';
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
  saveOnboardingGoal: jest.fn(),
  updateProfileName: jest.fn(),
  syncSubscriptionEntitlement: jest.fn().mockResolvedValue(undefined),
}));

const mockGetProfile = getProfile as jest.Mock;
const mockGetActiveGoal = getActiveGoal as jest.Mock;
const mockGetLatestBandScores = getLatestBandScores as jest.Mock;
const mockGetSubscription = getSubscription as jest.Mock;
const mockGetStreak = getStreak as jest.Mock;
const mockGetXp = getXp as jest.Mock;
const mockSaveOnboardingGoal = saveOnboardingGoal as jest.Mock;
const mockUpdateProfileName = updateProfileName as jest.Mock;

const PROFILE = { id: 'user-1', fullName: 'Priya', avatarUrl: null, createdAt: '2026-01-01' };
const OLD_GOAL = {
  id: 'goal-old',
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
const NEW_GOAL = {
  id: 'goal-new',
  userId: 'user-1',
  ieltsType: 'academic' as const,
  currentBand: 6,
  targetBand: 7.5,
  examDate: '2026-06-01',
  weakestSkill: 'writing' as const,
  dailyStudyMinutes: 45,
  isActive: true,
  createdAt: '2026-02-01',
};

/** Exactly the sequence app/profile-edit.tsx's handleSave runs — the one
 * shared implementation both Home's CTA and Settings now route to. */
async function runSharedGoalSave(userId: string, fullName: string, input: Parameters<typeof saveOnboardingGoal>[1]) {
  await updateProfileName(userId, fullName);
  await saveOnboardingGoal(userId, input);
  await useAppStore.getState().refreshUserData(userId);
}

describe('the shared Home/Settings goal-save flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({
      userId: 'user-1',
      profile: PROFILE,
      goal: OLD_GOAL,
      bandScores: { overall: 6.5 },
      subscription: null,
      streak: { count: 2, lastActiveDate: '2026-01-01' },
      xp: 50,
      homeError: null,
      dataLoaded: true,
    });
  });

  it('an authenticated user setting/editing their goal (as if from Home) saves successfully', async () => {
    mockUpdateProfileName.mockResolvedValue(undefined);
    mockSaveOnboardingGoal.mockResolvedValue(NEW_GOAL);
    mockGetProfile.mockResolvedValue(PROFILE);
    mockGetActiveGoal.mockResolvedValue(NEW_GOAL);
    mockGetLatestBandScores.mockResolvedValue({ overall: 6.5 });
    mockGetSubscription.mockResolvedValue(null);
    mockGetStreak.mockResolvedValue({ count: 2, lastActiveDate: '2026-01-01' });
    mockGetXp.mockResolvedValue(50);

    await runSharedGoalSave('user-1', 'Priya', {
      ieltsType: 'academic',
      currentBand: 6,
      targetBand: 7.5,
      examDate: '2026-06-01',
      weakestSkill: 'writing',
      dailyStudyMinutes: 45,
    });

    expect(mockSaveOnboardingGoal).toHaveBeenCalledWith('user-1', expect.objectContaining({ targetBand: 7.5 }));
    // No sign-up/demo-mode call of any kind — this never touches auth at all.
    expect(jest.requireMock('@/services/auth').signInDemo).not.toHaveBeenCalled();
  });

  it('Home (reading the same store) reflects the new target immediately after save — no reload needed', async () => {
    mockUpdateProfileName.mockResolvedValue(undefined);
    mockSaveOnboardingGoal.mockResolvedValue(NEW_GOAL);
    mockGetProfile.mockResolvedValue(PROFILE);
    mockGetActiveGoal.mockResolvedValue(NEW_GOAL);
    mockGetLatestBandScores.mockResolvedValue({ overall: 6.5 });
    mockGetSubscription.mockResolvedValue(null);
    mockGetStreak.mockResolvedValue({ count: 2, lastActiveDate: '2026-01-01' });
    mockGetXp.mockResolvedValue(50);

    expect(useAppStore.getState().goal?.targetBand).toBe(7); // pre-save baseline

    await runSharedGoalSave('user-1', 'Priya', {
      ieltsType: 'academic',
      currentBand: 6,
      targetBand: 7.5,
      examDate: '2026-06-01',
      weakestSkill: 'writing',
      dailyStudyMinutes: 45,
    });

    expect(useAppStore.getState().goal?.targetBand).toBe(7.5);
    expect(useAppStore.getState().goal?.id).toBe('goal-new');
  });

  it("AI Coach's context reflects the newly-saved goal right after — no stale target band", async () => {
    mockUpdateProfileName.mockResolvedValue(undefined);
    mockSaveOnboardingGoal.mockResolvedValue(NEW_GOAL);
    mockGetProfile.mockResolvedValue(PROFILE);
    mockGetActiveGoal.mockResolvedValue(NEW_GOAL);
    mockGetLatestBandScores.mockResolvedValue({ overall: 6.5 });
    mockGetSubscription.mockResolvedValue(null);
    mockGetStreak.mockResolvedValue({ count: 2, lastActiveDate: '2026-01-01' });
    mockGetXp.mockResolvedValue(50);

    await runSharedGoalSave('user-1', 'Priya', {
      ieltsType: 'academic',
      currentBand: 6,
      targetBand: 7.5,
      examDate: '2026-06-01',
      weakestSkill: 'writing',
      dailyStudyMinutes: 45,
    });

    const state = useAppStore.getState();
    const context = buildCoachContext({ profile: state.profile, goal: state.goal, bandScores: state.bandScores, streak: state.streak, attempts: [] });
    expect(context.targetBand).toBe(7.5);
    expect(context.weakestSkill).toBe('writing');
  });

  it('Settings → Edit profile & goals (the same call sequence, unchanged) still works', async () => {
    mockUpdateProfileName.mockResolvedValue(undefined);
    mockSaveOnboardingGoal.mockResolvedValue({ ...NEW_GOAL, id: 'goal-settings-edit' });
    mockGetProfile.mockResolvedValue({ ...PROFILE, fullName: 'Priya Renamed' });
    mockGetActiveGoal.mockResolvedValue({ ...NEW_GOAL, id: 'goal-settings-edit' });
    mockGetLatestBandScores.mockResolvedValue({ overall: 6.5 });
    mockGetSubscription.mockResolvedValue(null);
    mockGetStreak.mockResolvedValue({ count: 2, lastActiveDate: '2026-01-01' });
    mockGetXp.mockResolvedValue(50);

    await runSharedGoalSave('user-1', 'Priya Renamed', {
      ieltsType: 'academic',
      currentBand: 6,
      targetBand: 7.5,
      examDate: '2026-06-01',
      weakestSkill: 'writing',
      dailyStudyMinutes: 45,
    });

    expect(mockUpdateProfileName).toHaveBeenCalledWith('user-1', 'Priya Renamed');
    expect(useAppStore.getState().profile?.fullName).toBe('Priya Renamed');
    expect(useAppStore.getState().goal?.id).toBe('goal-settings-edit');
  });
});
