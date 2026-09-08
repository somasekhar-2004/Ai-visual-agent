import { create } from 'zustand';

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

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initial,
  setIeltsType: (ieltsType) => set({ ieltsType }),
  setCurrentBand: (currentBand) => set({ currentBand }),
  setTargetBand: (targetBand) => set({ targetBand }),
  setExamDate: (examDate) => set({ examDate }),
  setWeakestSkill: (weakestSkill) => set({ weakestSkill }),
  setDailyStudyMinutes: (dailyStudyMinutes) => set({ dailyStudyMinutes }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  reset: () => set(initial),
}));

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  'daily_reminder',
  'streak_reminder',
  'test_countdown',
  'unfinished_plan',
  'weekly_summary',
];
