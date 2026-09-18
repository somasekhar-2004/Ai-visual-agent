// Regression coverage for a real production bug: a user who already
// created a real account (e.g. via app/(auth)/sign-up.tsx, which
// establishes an immediate session) could still reach
// app/(onboarding)/account.tsx's "Create your account" / "Account already
// exists — sign in" screen while finishing their goal-setup answers, even
// though they were already authenticated — because nothing had put their
// real userId into useAppStore yet, so completeOnboarding() found it empty
// and (before this fix) fell back to a broken Demo Mode identity. These
// tests exercise the real screen component: an already-authenticated user
// must never see the sign-up choice screen at all, and a genuinely new,
// not-yet-authenticated user must still see it normally.

import { render, waitFor } from '@testing-library/react-native';
import React from 'react';

import AccountScreen from '@/app/(onboarding)/account';
import { ThemeProvider } from '@/hooks/useTheme';
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
import { useAppStore } from '@/store/useAppStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/services/auth', () => ({
  getCurrentUserId: jest.fn().mockResolvedValue(null),
  hasCompletedOnboarding: jest.fn().mockResolvedValue(false),
  setOnboardingComplete: jest.fn(),
  signInDemo: jest.fn(),
  signOut: jest.fn(),
  signUpWithEmail: jest.fn(),
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

const mockSaveOnboardingGoal = saveOnboardingGoal as jest.Mock;
const mockGetProfile = getProfile as jest.Mock;
const mockGetActiveGoal = getActiveGoal as jest.Mock;
const mockGetLatestBandScores = getLatestBandScores as jest.Mock;
const mockGetSubscription = getSubscription as jest.Mock;
const mockGetStreak = getStreak as jest.Mock;
const mockGetXp = getXp as jest.Mock;
const mockSetNotificationPref = setNotificationPref as jest.Mock;

const GOAL = {
  id: 'goal-1',
  userId: 'real-user-42',
  ieltsType: 'academic' as const,
  currentBand: 6,
  targetBand: 7,
  examDate: '2026-12-01',
  weakestSkill: null,
  dailyStudyMinutes: 30,
  isActive: true,
  createdAt: '2026-01-01',
};

async function renderScreen() {
  return render(
    <ThemeProvider>
      <AccountScreen />
    </ThemeProvider>
  );
}

describe('AccountScreen — an already-authenticated user is never re-prompted to sign up', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useOnboardingStore.setState({
      ieltsType: 'academic',
      currentBand: 6,
      targetBand: 7,
      examDate: '2026-12-01',
      weakestSkill: null,
      dailyStudyMinutes: 30,
      notificationsEnabled: true,
    });
    useAppStore.setState({
      isHydrated: true,
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
    mockSaveOnboardingGoal.mockResolvedValue(GOAL);
    mockGetProfile.mockResolvedValue(null);
    mockGetActiveGoal.mockResolvedValue(GOAL);
    mockGetLatestBandScores.mockResolvedValue({});
    mockGetSubscription.mockResolvedValue(null);
    mockGetStreak.mockResolvedValue({ count: 0, lastActiveDate: null });
    mockGetXp.mockResolvedValue(0);
    mockSetNotificationPref.mockResolvedValue(undefined);
  });

  it('a user with a real userId already in the store never sees "Create your account" — it auto-saves under the real id and moves on', async () => {
    useAppStore.setState({ userId: 'real-user-42' });

    const { queryByText } = await renderScreen();

    // The sign-up choice screen must never render at all for this user.
    expect(queryByText('Create your account')).toBeNull();
    expect(queryByText('Account already exists')).toBeNull();

    await waitFor(() =>
      expect(mockSaveOnboardingGoal).toHaveBeenCalledWith('real-user-42', expect.objectContaining({ ieltsType: 'academic', targetBand: 7 }))
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/plan-ready'));
  });

  it('a genuinely new, not-yet-authenticated user still sees the normal sign-up choice screen', async () => {
    useAppStore.setState({ userId: null });

    const { getByText } = await renderScreen();

    expect(getByText('Create your account')).toBeTruthy();
    expect(mockSaveOnboardingGoal).not.toHaveBeenCalled();
  });
});
