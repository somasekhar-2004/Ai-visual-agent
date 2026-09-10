import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { IeltsType, NotificationCategory, SkillKey } from '@/types/models';

type OnboardingState = {
  ieltsType: IeltsType | null;
  currentBand: number | null;
  targetBand: number | null;
  examDate: string | null; // YYYY-MM-DD
  weakestSkill: SkillKey | null;
  dailyStudyMinutes: number | null;
  notificationsEnabled: boolean;

  setIeltsType: (v: IeltsType) => void;
  setCurrentBand: (v: number) => void;
  setTargetBand: (v: number) => void;
  setExamDate: (v: string | null) => void;
  setWeakestSkill: (v: SkillKey) => void;
  setDailyStudyMinutes: (v: number) => void;
  setNotificationsEnabled: (v: boolean) => void;
  reset: () => void;
};

const initial = {
  ieltsType: null,
  currentBand: null,
  targetBand: null,
  examDate: null,
  weakestSkill: null,
  dailyStudyMinutes: null,
  notificationsEnabled: true,
};

// Persisted (unlike most other Zustand stores in this app) because the
// account-creation step of onboarding can require an email-confirmation
// round trip: the user fills out this whole wizard, taps "Create account",
// then has to leave the app to open their email client and tap a link.
// Android can and does kill backgrounded apps under memory pressure during
// that gap — an in-memory-only store would silently lose every answer the
// user just gave, and app/confirm.tsx would have nothing to save a goal
// from once they come back. `reset()` clears this once the goal is
// actually saved (see app/confirm.tsx and app/(onboarding)/account.tsx),
// so a stale wizard answer never leaks into a later, unrelated onboarding
// attempt.
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initial,
      setIeltsType: (ieltsType) => set({ ieltsType }),
      setCurrentBand: (currentBand) => set({ currentBand }),
      setTargetBand: (targetBand) => set({ targetBand }),
      setExamDate: (examDate) => set({ examDate }),
      setWeakestSkill: (weakestSkill) => set({ weakestSkill }),
      setDailyStudyMinutes: (dailyStudyMinutes) => set({ dailyStudyMinutes }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      reset: () => set(initial),
    }),
    {
      name: 'ielts-prep/onboarding/wizard-answers',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  'daily_reminder',
  'streak_reminder',
  'test_countdown',
  'unfinished_plan',
  'weekly_summary',
];
