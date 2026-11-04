// Regression test for a real bug: Home is a persistent tab, so navigating
// to Practice (or a mock/writing/speaking/grammar session) and back never
// unmounts/remounts it — useQuery's own "fetch on mount" behavior only
// fires once, and question count/accuracy then kept showing stale data
// until the whole app was restarted (a fresh QueryClient). The fix adds a
// focus-triggered invalidation in ProgressDashboard (components/dashboard/
// ProgressDashboard.tsx) for exactly the queries that drive those stats.
// This test proves the fix end-to-end: render once, change what the
// repository would return (simulating practice happening elsewhere while
// this screen stayed mounted), fire a second focus event the same way
// returning to the tab would, and confirm the displayed numbers update —
// all without unmounting/remounting the component.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import { ProgressDashboard } from '@/components/dashboard/ProgressDashboard';
import { ThemeProvider } from '@/hooks/useTheme';
import { getBandScoreHistory, getQuestionAttempts, getTestHistory } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

jest.mock('@/services/repository', () => ({
  getQuestionAttempts: jest.fn(),
  getTestHistory: jest.fn(),
  getBandScoreHistory: jest.fn(),
}));

// Captures the real callback ProgressDashboard registers with
// useFocusEffect so the test can fire it manually — exactly like Expo
// Router/React Navigation would on every screen-focus event, including
// "the user navigated back to this already-mounted tab".
let focusCallback: (() => void) | null = null;
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useFocusEffect: (cb: () => void) => {
    focusCallback = cb;
  },
}));

const mockGetQuestionAttempts = getQuestionAttempts as jest.Mock;
const mockGetTestHistory = getTestHistory as jest.Mock;
const mockGetBandScoreHistory = getBandScoreHistory as jest.Mock;

function resetStore() {
  useAppStore.setState({
    userId: 'user-1',
    profile: { id: 'user-1', fullName: 'Alex', avatarUrl: null, createdAt: '2026-01-01' },
    goal: null,
    bandScores: {},
    subscription: null,
    streak: { count: 0, lastActiveDate: null },
  });
}

async function renderDashboard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ProgressDashboard onSetGoal={jest.fn()} onUpgrade={jest.fn()} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

describe('ProgressDashboard — question count/accuracy refresh when the tab regains focus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    focusCallback = null;
    resetStore();
  });

  it('updates question count and accuracy on the second focus, without remounting', async () => {
    mockGetQuestionAttempts.mockResolvedValue([
      { id: 'a1', questionId: 'q1', isCorrect: true },
      { id: 'a2', questionId: 'q2', isCorrect: false },
    ]);
    mockGetTestHistory.mockResolvedValue([]);
    mockGetBandScoreHistory.mockResolvedValue([]);

    const { getAllByText, getByText, unmount } = await renderDashboard();

    await waitFor(() => expect(getByText('2')).toBeTruthy()); // 2 questions done
    expect(getAllByText('50%').length).toBeGreaterThan(0); // 1/2 correct

    // The first focus callback registered is the one that fires right after
    // mount in real navigation — ProgressDashboard deliberately treats that
    // one as a no-op (useQuery already fetched on mount), matching the real
    // "first focus happens immediately after mount" sequence.
    expect(focusCallback).not.toBeNull();
    await act(async () => focusCallback!());

    // Simulates real practice having happened: the user went to Practice,
    // answered more questions, and came back — the repository would now
    // return different data, but nothing has told this still-mounted
    // component to re-fetch it yet.
    mockGetQuestionAttempts.mockResolvedValue([
      { id: 'a1', questionId: 'q1', isCorrect: true },
      { id: 'a2', questionId: 'q2', isCorrect: false },
      { id: 'a3', questionId: 'q3', isCorrect: true },
      { id: 'a4', questionId: 'q4', isCorrect: true },
    ]);

    // The SECOND focus event — exactly what happens when Expo Router
    // returns focus to this already-mounted tab after Practice pops back.
    await act(async () => focusCallback!());

    await waitFor(() => expect(getByText('4')).toBeTruthy()); // now 4 questions done
    expect(getAllByText('75%').length).toBeGreaterThan(0); // 3/4 correct
    expect(mockGetQuestionAttempts).toHaveBeenCalledTimes(2); // once on mount, once on the real focus event
    unmount();
  });

  it("the first focus event alone (no second one) never triggers a refetch — useQuery's own mount-fetch already covered it", async () => {
    mockGetQuestionAttempts.mockResolvedValue([{ id: 'a1', questionId: 'q1', isCorrect: true }]);
    mockGetTestHistory.mockResolvedValue([]);
    mockGetBandScoreHistory.mockResolvedValue([]);

    const { getByText, unmount } = await renderDashboard();
    await waitFor(() => expect(getByText('1')).toBeTruthy());
    expect(mockGetQuestionAttempts).toHaveBeenCalledTimes(1);

    await act(async () => focusCallback!());

    expect(mockGetQuestionAttempts).toHaveBeenCalledTimes(1);
    unmount();
  });
});
