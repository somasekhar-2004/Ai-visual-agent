import { create } from 'zustand';

import {
  getCurrentUserId,
  hasCompletedOnboarding,
  setOnboardingComplete,
  signInDemo,
  signOut as authSignOut,
} from '@/services/auth';
import {
  getActiveGoal,
  getLatestBandScores,
  getProfile,
  getStreak,
  getSubscription,
  getXp,
  type OnboardingInput,
  type SkillBandMap,
  saveOnboardingGoal,
  syncSubscriptionEntitlement,
} from '@/services/repository';
import type { Profile, Subscription, UserGoal } from '@/types/models';

type AppState = {
  isHydrated: boolean;
  userId: string | null;
  onboardingComplete: boolean;
  profile: Profile | null;
  goal: UserGoal | null;
  bandScores: SkillBandMap;
  subscription: Subscription | null;
  streak: { count: number; lastActiveDate: string | null };
  xp: number;
  // Set when the most recent refreshUserData() had at least one query fail
  // (e.g. a real Supabase/RLS error) — never inferred from missing data,
  // since "no goal yet" and "the goal query failed" must render differently
  // (see app/(tabs)/index.tsx). Cleared on the next successful refresh.
  homeError: string | null;
  // True once the initial post-sign-in data fetch (refreshUserData, or its
  // absence when there's no signed-in user) has genuinely settled — either
  // way, success or failure. `isHydrated` alone is NOT this: it flips true
  // synchronously inside hydrate() before refreshUserData is even awaited,
  // so a component gating on isHydrated alone can render with `goal` still
  // at its initial `null` and mistake "haven't fetched yet" for "confirmed
  // this user has no goal" — exactly the bug that sent an existing,
  // already-onboarded user back to the "let's set up your goal" screen.
  dataLoaded: boolean;

  hydrate: () => Promise<void>;
  refreshUserData: (userId: string) => Promise<void>;
  syncEntitlement: () => Promise<void>;
  enterDemoMode: () => Promise<void>;
  completeOnboarding: (input: OnboardingInput) => Promise<void>;
  signOut: () => Promise<void>;
  setSubscriptionState: (subscription: Subscription) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
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

  hydrate: async () => {
    try {
      const [userId, onboardingComplete] = await Promise.all([getCurrentUserId(), hasCompletedOnboarding()]);
      set({ userId, onboardingComplete, isHydrated: true });
      if (userId) {
        await syncSubscriptionEntitlement(userId);
        await get().refreshUserData(userId);
      } else {
        // No signed-in user — there is nothing for refreshUserData to fetch,
        // so there's no "still loading" state left to wait out.
        set({ dataLoaded: true });
      }
    } catch (err) {
      // Never let a startup failure leave isHydrated stuck at false (the
      // splash screen would then never hide) — surface it as a recoverable
      // homeError instead of an unhandled rejection. dataLoaded must also
      // be set here: without it, a failure thrown before refreshUserData
      // ever ran (e.g. syncSubscriptionEntitlement) would leave Home stuck
      // showing a loading spinner forever instead of the error screen.
      console.warn('[app] hydrate failed:', (err as Error).message);
      set({ isHydrated: true, dataLoaded: true, homeError: (err as Error).message });
    }
  },

  syncEntitlement: async () => {
    const userId = get().userId;
    if (!userId) return;
    await syncSubscriptionEntitlement(userId);
    await get().refreshUserData(userId);
  },

  refreshUserData: async (userId: string) => {
    const results = await Promise.allSettled([
      getProfile(userId),
      getActiveGoal(userId),
      getLatestBandScores(userId),
      getSubscription(userId),
      getStreak(userId),
      getXp(userId),
    ]);
    const [profileR, goalR, bandScoresR, subscriptionR, streakR, xpR] = results;
    // A single failing query (e.g. one table's RLS/permission error) must
    // never wipe out the others' successful results — each field keeps its
    // last-known value on failure rather than the whole screen going blank.
    const current = get();
    const rejected = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
    if (rejected.length) {
      console.warn(
        '[app] refreshUserData: one or more queries failed:',
        rejected.map((r) => (r.reason as Error)?.message ?? r.reason)
      );
    }
    set({
      profile: profileR.status === 'fulfilled' ? profileR.value : current.profile,
      goal: goalR.status === 'fulfilled' ? goalR.value : current.goal,
      bandScores: bandScoresR.status === 'fulfilled' ? bandScoresR.value : current.bandScores,
      subscription: subscriptionR.status === 'fulfilled' ? subscriptionR.value : current.subscription,
      streak: streakR.status === 'fulfilled' ? streakR.value : current.streak,
      xp: xpR.status === 'fulfilled' ? xpR.value : current.xp,
      homeError: rejected.length ? ((rejected[0].reason as Error)?.message ?? 'Failed to load your data.') : null,
      dataLoaded: true,
    });
  },

  enterDemoMode: async () => {
    const result = await signInDemo();
    if ('userId' in result) {
      set({ userId: result.userId });
      await get().refreshUserData(result.userId);
    }
  },

  completeOnboarding: async (input: OnboardingInput) => {
    let userId = get().userId;
    if (!userId) {
      const result = await signInDemo();
      if ('userId' in result) userId = result.userId;
    }
    if (!userId) throw new Error('No signed-in user to attach onboarding data to.');
    await saveOnboardingGoal(userId, input);
    // Deliberately does NOT call refreshOverallBand here: a brand-new user
    // has taken zero tests at onboarding time, and refreshOverallBand
    // correctly refuses to compute an overall band until all four skills
    // have a real score — calling it here would have been a no-op at best,
    // and was previously the exact place a fabricated "Overall Band 6.0"
    // got recorded before any test was ever attempted.
    await setOnboardingComplete();
    set({ userId, onboardingComplete: true });
    await get().refreshUserData(userId);
  },

  signOut: async () => {
    await authSignOut();
    set({
      userId: null,
      profile: null,
      goal: null,
      bandScores: {},
      subscription: null,
      streak: { count: 0, lastActiveDate: null },
      xp: 0,
    });
  },

  setSubscriptionState: (subscription: Subscription) => set({ subscription }),
}));
