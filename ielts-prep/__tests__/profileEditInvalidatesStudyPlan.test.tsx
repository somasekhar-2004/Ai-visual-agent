// Regression coverage for the real-device release blocker: editing a goal
// in Settings -> Edit profile & goals (app/profile-edit.tsx) left Home's
// Today's Study Plan AI note showing the OLD target band/daily minutes for
// the rest of that calendar day. lib/studyPlanQueryKeys.ts's goal.id-based
// key already fixes this structurally, but this test proves the belt-
// and-braces explicit invalidation in profile-edit.tsx's save handler also
// fires, for anything that read the query before the new goal.id landed in
// the store.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import ProfileEditScreen from '@/app/profile-edit';
import { ThemeProvider } from '@/hooks/useTheme';
import { saveOnboardingGoal, updateProfileName } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));

jest.mock('@/services/repository', () => ({
  saveOnboardingGoal: jest.fn(),
  updateProfileName: jest.fn(),
}));

jest.mock('@/services/auth', () => ({
  getCurrentUserId: jest.fn().mockResolvedValue('user-1'),
  hasCompletedOnboarding: jest.fn().mockResolvedValue(true),
  setOnboardingComplete: jest.fn(),
  signOut: jest.fn(),
}));

const mockUpdateProfileName = updateProfileName as jest.Mock;
const mockSaveOnboardingGoal = saveOnboardingGoal as jest.Mock;

describe('profile-edit.tsx save — invalidates study-plan/study-plan-focus queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({
      userId: 'user-1',
      profile: { id: 'user-1', fullName: 'Priya', avatarUrl: null, createdAt: '2026-01-01' },
      goal: {
        id: 'goal-old',
        userId: 'user-1',
        ieltsType: 'academic',
        currentBand: 6,
        targetBand: 7,
        examDate: null,
        weakestSkill: null,
        dailyStudyMinutes: 30,
        isActive: true,
        createdAt: '2026-01-01',
      },
      refreshUserData: jest.fn().mockImplementation(async () => {
        useAppStore.setState({
          goal: {
            id: 'goal-new',
            userId: 'user-1',
            ieltsType: 'academic',
            currentBand: 6,
            targetBand: 8,
            examDate: null,
            weakestSkill: null,
            dailyStudyMinutes: 30,
            isActive: true,
            createdAt: '2026-01-02',
          },
        });
      }),
    });
    mockUpdateProfileName.mockResolvedValue(undefined);
    mockSaveOnboardingGoal.mockResolvedValue({ id: 'goal-new' });
  });

  it('invalidates both study-plan and study-plan-focus for this user on save', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { getByText } = await render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ProfileEditScreen />
        </ThemeProvider>
      </QueryClientProvider>
    );

    fireEvent.press(getByText('Save changes'));

    await waitFor(() => expect(mockSaveOnboardingGoal).toHaveBeenCalled());
    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['study-plan-focus', 'user-1'] })
    );
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['study-plan', 'user-1'] });
  });
});
