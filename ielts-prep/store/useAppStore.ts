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
  refreshOverallBand,
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

  hydrate: async () => {
    try {
      const [userId, onboardingComplete] = await Promise.all([getCurrentUserId(), hasCompletedOnboarding()]);
      set({ userId, onboardingComplete, isHydrated: true });
      if (userId) {
        await syncSubscriptionEntitlement(userId);
        await get().refreshUserData(userId);
      }
    } catch (err) {
      // Never let a startup failure leave isHydrated stuck at false (the
      // splash screen would then never hide) — surface it as a recoverable
      // homeError instead of an unhandled rejection.
      console.warn('[app] hydrate failed:', (err as Error).message);
      set({ isHydrated: true, homeError: (err as Error).message });
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
    await refreshOverallBand(userId);
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
