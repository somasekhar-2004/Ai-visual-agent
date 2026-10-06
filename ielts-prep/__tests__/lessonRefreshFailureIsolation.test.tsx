// Regression coverage for a specific, narrow question: once a lesson
// completion has genuinely been SAVED (markLessonComplete + recordDailyActivity
// both succeeded), can a later, unrelated failure inside refreshUserData()
// — one of the several independent reads it fans out to, e.g. a transient
// getProfile error — get misreported to the user as "completing the lesson
// failed", or leave the screen in a state that invites a duplicate submit?
//
// app/lesson/[id].tsx wraps markLessonComplete + recordDailyActivity +
// invalidateQueries + refreshUserData in ONE try/catch, so this is the one
// screen (of the seven touched for the dashboard-refresh fix) where a save
// and a refresh share a catch block — the highest-risk place for exactly
// this kind of mislabeling. useAppStore's own refreshUserData is NOT
// mocked here (only the leaf repository functions it calls are) — proving
// the real Promise.allSettled implementation genuinely never rejects, not
// a test double that assumes it.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import LessonDetailScreen from '@/app/lesson/[id]';
import { ThemeProvider } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';

const REAL_LESSON_ID = '10000000-0000-0000-0000-000000000001';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '10000000-0000-0000-0000-000000000001' }),
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('@/services/repository', () => ({
  markLessonComplete: jest.fn().mockResolvedValue(undefined),
  recordDailyActivity: jest.fn().mockResolvedValue(undefined),
  getLessonProgressMap: jest.fn().mockResolvedValue({}),
  // The leaves refreshUserData's own Promise.allSettled fans out to — see
  // store/useAppStore.ts. getActiveGoal is the one made to fail below;
  // the rest resolve so the only question under test is whether THAT
  // one failure leaks out as a thrown error from handleComplete.
  getProfile: jest.fn().mockResolvedValue(null),
  getActiveGoal: jest.fn(),
  getLatestBandScores: jest.fn().mockResolvedValue({}),
  getSubscription: jest.fn().mockResolvedValue(null),
  getStreak: jest.fn().mockResolvedValue({ count: 1, lastActiveDate: '2026-10-05' }),
  getXp: jest.fn().mockResolvedValue(15),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const repo = require('@/services/repository');

async function renderScreen() {
  useAppStore.setState({ userId: 'user-1' });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LessonDetailScreen />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe('lesson completion — a refreshUserData failure must never be reported as a save failure', () => {
  afterEach(() => jest.clearAllMocks());

  it('shows no error and does not re-arm the button for a resubmit when only the refresh-side getActiveGoal call fails', async () => {
    repo.getActiveGoal.mockRejectedValue(new Error('permission denied for table user_goals'));
    const { getByText, queryByText } = await renderScreen();

    await fireEvent.press(getByText('Mark as complete'));

    await waitFor(() => expect(repo.recordDailyActivity).toHaveBeenCalledWith('user-1', 15));
    // The real save calls genuinely ran and succeeded before refreshUserData
    // was ever called — confirming this isn't a false pass from the save
    // itself having failed too.
    expect(repo.markLessonComplete).toHaveBeenCalledWith('user-1', REAL_LESSON_ID);

    // No error text anywhere — specifically not the refresh-side error
    // message, and not a generic failure message either.
    expect(queryByText(/permission denied/)).toBeNull();
    expect(queryByText(/failed/i)).toBeNull();
    // Button re-enabled (loading cleared) in its NORMAL state — not an
    // error-retry state that would invite pressing it again and calling
    // markLessonComplete a second time for an already-completed lesson.
    expect(queryByText('Mark as complete')).toBeTruthy();
  });

  it('a genuine save failure (markLessonComplete itself) IS reported, for contrast — proving the test above isn\'t just "errors are always swallowed"', async () => {
    repo.getActiveGoal.mockResolvedValue(null);
    repo.markLessonComplete.mockRejectedValue(new Error('Failed to save your lesson progress'));
    const { getByText } = await renderScreen();

    await fireEvent.press(getByText('Mark as complete'));

    await waitFor(() => expect(getByText('Failed to save your lesson progress')).toBeTruthy());
    expect(repo.recordDailyActivity).not.toHaveBeenCalled();
  });
});
