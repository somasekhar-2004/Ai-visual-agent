// Regression coverage for the Home white-screen investigation: Home used to
// render `null` whenever `goal` was falsy, and refreshUserData's
// Promise.all meant a single failing query (e.g. one table hitting a
// permission error) wiped out every other field too, since Promise.all
// rejects — and resolves nothing — as soon as any one promise rejects.
// These tests mock @/services/repository directly (not Supabase) since the
// store calls those functions by name.

import { getActiveGoal, getLatestBandScores, getProfile, getStreak, getSubscription, getXp, saveOnboardingGoal, syncSubscriptionEntitlement } from '@/services/repository';
import { getCurrentUserId, hasCompletedOnboarding } from '@/services/auth';
import { getHomeViewState } from '@/lib/homeViewState';
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
const mockSyncSubscriptionEntitlement = syncSubscriptionEntitlement as jest.Mock;
const mockGetCurrentUserId = getCurrentUserId as jest.Mock;
const mockHasCompletedOnboarding = hasCompletedOnboarding as jest.Mock;

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
    dataLoaded: false,
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
    // A failed refresh still counts as "settled" — Home must show the error
    // screen, never a stuck loading spinner.
    expect(state.dataLoaded).toBe(true);
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
    expect(useAppStore.getState().dataLoaded).toBe(true);
  });
});

// Regression coverage for the real-Android bug this session found: Home kept
// showing "Let's set up your study goal" for an existing, already-onboarded
// user. `isHydrated` flips true synchronously inside hydrate() *before*
// refreshUserData (which populates `goal`) is even awaited, and Home read no
// other signal — so a component gating on isHydrated alone could render with
// `goal` still at its initial `null` and read that as "confirmed no goal",
// identical to a genuinely new user. `dataLoaded` is the fix: it only
// becomes true once the initial fetch has genuinely settled, one way or the
// other. These tests exercise hydrate() end-to-end and feed the resulting
// store state through lib/homeViewState.ts's getHomeViewState — the same
// function app/(tabs)/index.tsx uses to decide what to render — so they
// prove what Home would actually show, not just what fields got set.
describe('hydrate — dataLoaded distinguishes "still fetching" from every settled outcome', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
    mockGetCurrentUserId.mockResolvedValue('user-1');
    mockHasCompletedOnboarding.mockResolvedValue(true);
    mockSyncSubscriptionEntitlement.mockResolvedValue(undefined);
  });

  it('an existing user with an active goal: dataLoaded settles true and Home would show the real dashboard, not the setup screen', async () => {
    mockGetProfile.mockResolvedValue(PROFILE);
    mockGetActiveGoal.mockResolvedValue(GOAL);
    mockGetLatestBandScores.mockResolvedValue({ overall: 6.5 });
    mockGetSubscription.mockResolvedValue(null);
    mockGetStreak.mockResolvedValue({ count: 3, lastActiveDate: '2026-01-01' });
    mockGetXp.mockResolvedValue(120);

    await useAppStore.getState().hydrate();

    const state = useAppStore.getState();
    expect(state.dataLoaded).toBe(true);
    expect(getHomeViewState(state)).toBe('ready');
  });

  it('no signed-in user: dataLoaded still settles true (nothing left to wait for) instead of leaving Home stuck loading', async () => {
    mockGetCurrentUserId.mockResolvedValueOnce(null);

    await useAppStore.getState().hydrate();

    const state = useAppStore.getState();
    expect(state.dataLoaded).toBe(true);
    expect(mockGetActiveGoal).not.toHaveBeenCalled();
  });

  it('a genuinely new user with no goal rows at all: Home still shows the real dashboard (with a goal-setup CTA card inside it), not a permanent loading spinner', async () => {
    mockGetProfile.mockResolvedValue(PROFILE);
    mockGetActiveGoal.mockResolvedValue(null); // getActiveGoal already proved it checked for a historical row too — see homeGoalRecovery.test.ts
    mockGetLatestBandScores.mockResolvedValue({});
    mockGetSubscription.mockResolvedValue(null);
    mockGetStreak.mockResolvedValue({ count: 0, lastActiveDate: null });
    mockGetXp.mockResolvedValue(0);

    await useAppStore.getState().hydrate();

    const state = useAppStore.getState();
    expect(state.dataLoaded).toBe(true);
    expect(state.homeError).toBeNull();
    expect(state.goal).toBeNull();
    // No full-screen "let's set up your goal" state exists anymore — Home
    // always renders "ready" and ProgressDashboard's Target progress card
    // degrades to a setup CTA on its own when `goal` is null.
    expect(getHomeViewState(state)).toBe('ready');
  });

  it('a scoped query failure (only the goal query) during the initial load: Home still shows the real dashboard — a missing/failed goal must not blank the rest of the screen', async () => {
    mockGetProfile.mockResolvedValue(PROFILE);
    mockGetActiveGoal.mockRejectedValue(new Error('permission denied for table user_goals'));
    mockGetLatestBandScores.mockResolvedValue({ overall: 6.5 });
    mockGetSubscription.mockResolvedValue(null);
    mockGetStreak.mockResolvedValue({ count: 0, lastActiveDate: null });
    mockGetXp.mockResolvedValue(0);

    await useAppStore.getState().hydrate();

    const state = useAppStore.getState();
    expect(state.dataLoaded).toBe(true);
    expect(state.homeError).toMatch(/permission denied/);
    expect(state.profile).toEqual(PROFILE);
    expect(state.bandScores).toEqual({ overall: 6.5 });
    // profile (and every other independently-fetched field) still loaded,
    // so this renders "ready" with an inline retry banner for homeError and
    // the goal card degraded — never the old full-screen error state.
    expect(getHomeViewState(state)).toBe('ready');
  });

  it('a failure that leaves nothing usable at all (e.g. every table permission-denied, so profile never loads either): Home shows the full-screen error/retry state', async () => {
    mockGetProfile.mockRejectedValue(new Error('permission denied for table profiles'));
    mockGetActiveGoal.mockRejectedValue(new Error('permission denied for table user_goals'));
    mockGetLatestBandScores.mockRejectedValue(new Error('permission denied for table band_scores'));
    mockGetSubscription.mockRejectedValue(new Error('permission denied for table subscriptions'));
    mockGetStreak.mockRejectedValue(new Error('permission denied for table streaks'));
    mockGetXp.mockRejectedValue(new Error('permission denied for table xp'));

    await useAppStore.getState().hydrate();

    const state = useAppStore.getState();
    expect(state.dataLoaded).toBe(true);
    expect(state.profile).toBeNull();
    expect(state.homeError).toMatch(/permission denied/);
    expect(getHomeViewState(state)).toBe('error');
  });

  it('a failure before refreshUserData even runs (e.g. entitlement sync throwing) still settles dataLoaded, so Home shows the error screen instead of hanging on a spinner forever', async () => {
    mockSyncSubscriptionEntitlement.mockRejectedValue(new Error('network unreachable'));

    await useAppStore.getState().hydrate();

    const state = useAppStore.getState();
    expect(state.dataLoaded).toBe(true);
    expect(state.homeError).toMatch(/network unreachable/);
    expect(getHomeViewState(state)).toBe('error');
    expect(mockGetActiveGoal).not.toHaveBeenCalled();
  });

  it('while the initial fetch is still in flight, dataLoaded stays false and Home would show a loading state, never the setup screen', async () => {
    let resolveGoal!: (value: null) => void;
    mockGetProfile.mockResolvedValue(PROFILE);
    mockGetActiveGoal.mockReturnValue(new Promise((resolve) => { resolveGoal = resolve; }));
    mockGetLatestBandScores.mockResolvedValue({});
    mockGetSubscription.mockResolvedValue(null);
    mockGetStreak.mockResolvedValue({ count: 0, lastActiveDate: null });
    mockGetXp.mockResolvedValue(0);

    const hydratePromise = useAppStore.getState().hydrate();
    // Let every already-resolved microtask (getCurrentUserId, the sync
    // entitlement call) flush, but getActiveGoal is still pending.
    await Promise.resolve();
    await Promise.resolve();

    const midFlightState = useAppStore.getState();
    expect(midFlightState.dataLoaded).toBe(false);
    expect(getHomeViewState(midFlightState)).toBe('loading');

    resolveGoal(null);
    await hydratePromise;

    expect(useAppStore.getState().dataLoaded).toBe(true);
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
