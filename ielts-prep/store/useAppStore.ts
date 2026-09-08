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

  hydrate: async () => {
    const [userId, onboardingComplete] = await Promise.all([getCurrentUserId(), hasCompletedOnboarding()]);
    set({ userId, onboardingComplete, isHydrated: true });
    if (userId) {
      await syncSubscriptionEntitlement(userId);
      await get().refreshUserData(userId);
    }
  },

  syncEntitlement: async () => {
    const userId = get().userId;
    if (!userId) return;
    await syncSubscriptionEntitlement(userId);
    await get().refreshUserData(userId);
  },

  refreshUserData: async (userId: string) => {
    const [profile, goal, bandScores, subscription, streak, xp] = await Promise.all([
      getProfile(userId),
      getActiveGoal(userId),
      getLatestBandScores(userId),
      getSubscription(userId),
      getStreak(userId),
      getXp(userId),
    ]);
    set({ profile, goal, bandScores, subscription, streak, xp });
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
