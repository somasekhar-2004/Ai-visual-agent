// Regression coverage for a real bug found during the launch-readiness
// audit: app/(onboarding)/notifications.tsx let the user choose "remind me"
// vs "don't remind me", but that choice was only ever written to the
// ephemeral onboarding wizard store — nothing downstream ever read it, so
// the choice was captured and then silently discarded. The real,
// user-facing preference mechanism is services/repository's
// getNotificationPrefs/setNotificationPref (used by
// app/notification-settings.tsx) plus services/notifications'
// applyNotificationPreferences, which actually requests permission and
// schedules/cancels the on-device notifications. These tests prove
// completeOnboarding() now translates the wizard's single yes/no answer
// into that real mechanism for every NotificationCategory, and that a
// failure in that step never blocks onboarding from completing.

import {
  getActiveGoal,
  getLatestBandScores,
  getProfile,
  getStreak,
  getSubscription,
  getXp,
  saveOnboardingGoal,
  setNotificationPref,
} from '@/services/repository';
import { applyNotificationPreferences } from '@/services/notifications';
import { NOTIFICATION_CATEGORIES, useOnboardingStore } from '@/store/useOnboardingStore';
import { useAppStore } from '@/store/useAppStore';

jest.mock('@/services/auth', () => ({
  getCurrentUserId: jest.fn().mockResolvedValue('user-1'),
  hasCompletedOnboarding: jest.fn().mockResolvedValue(true),
  setOnboardingComplete: jest.fn(),
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
  setNotificationPref: jest.fn(),
  syncSubscriptionEntitlement: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/services/notifications', () => ({
  applyNotificationPreferences: jest.fn(),
}));

const mockGetProfile = getProfile as jest.Mock;
const mockGetActiveGoal = getActiveGoal as jest.Mock;
const mockGetLatestBandScores = getLatestBandScores as jest.Mock;
const mockGetSubscription = getSubscription as jest.Mock;
const mockGetStreak = getStreak as jest.Mock;
const mockGetXp = getXp as jest.Mock;
const mockSaveOnboardingGoal = saveOnboardingGoal as jest.Mock;
const mockSetNotificationPref = setNotificationPref as jest.Mock;
const mockApplyNotificationPreferences = applyNotificationPreferences as jest.Mock;

const GOAL = {
  id: 'goal-1',
  userId: 'user-1',
  ieltsType: 'academic' as const,
  currentBand: 6,
  targetBand: 7,
  examDate: '2026-12-01',
  weakestSkill: null,
  dailyStudyMinutes: 30,
  isActive: true,
  createdAt: '2026-01-01',
};

const ONBOARDING_INPUT = {
  ieltsType: 'academic' as const,
  currentBand: 6,
  targetBand: 7,
  examDate: '2026-12-01',
  weakestSkill: null,
  dailyStudyMinutes: 30,
};

function resetStores() {
  useAppStore.setState({
    isHydrated: false,
    userId: 'user-1',
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
  useOnboardingStore.setState({ notificationsEnabled: true });
}

describe('completeOnboarding — wires the onboarding notification choice into the real mechanism', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStores();
    mockSaveOnboardingGoal.mockResolvedValue(GOAL);
    mockGetProfile.mockResolvedValue(null);
    mockGetActiveGoal.mockResolvedValue(GOAL);
    mockGetLatestBandScores.mockResolvedValue({});
    mockGetSubscription.mockResolvedValue(null);
    mockGetStreak.mockResolvedValue({ count: 0, lastActiveDate: null });
    mockGetXp.mockResolvedValue(0);
  });

  it('when the user chose "remind me", persists every category as enabled and applies the schedule with the exam date', async () => {
    useOnboardingStore.setState({ notificationsEnabled: true });

    await useAppStore.getState().completeOnboarding(ONBOARDING_INPUT);

    expect(mockSetNotificationPref).toHaveBeenCalledTimes(NOTIFICATION_CATEGORIES.length);
    for (const category of NOTIFICATION_CATEGORIES) {
      expect(mockSetNotificationPref).toHaveBeenCalledWith('user-1', category, true);
    }
    expect(mockApplyNotificationPreferences).toHaveBeenCalledWith(
      Object.fromEntries(NOTIFICATION_CATEGORIES.map((c) => [c, true])),
      '2026-12-01'
    );
  });

  it('when the user chose "don\'t remind me", persists every category as disabled', async () => {
    useOnboardingStore.setState({ notificationsEnabled: false });

    await useAppStore.getState().completeOnboarding(ONBOARDING_INPUT);

    for (const category of NOTIFICATION_CATEGORIES) {
      expect(mockSetNotificationPref).toHaveBeenCalledWith('user-1', category, false);
    }
    expect(mockApplyNotificationPreferences).toHaveBeenCalledWith(
      Object.fromEntries(NOTIFICATION_CATEGORIES.map((c) => [c, false])),
      '2026-12-01'
    );
  });

  it('a failure while applying the notification preference never blocks onboarding from completing', async () => {
    mockSetNotificationPref.mockRejectedValue(new Error('network unreachable'));

    await expect(useAppStore.getState().completeOnboarding(ONBOARDING_INPUT)).resolves.toBeUndefined();

    expect(useAppStore.getState().onboardingComplete).toBe(true);
    expect(mockSaveOnboardingGoal).toHaveBeenCalled();
  });
});
