import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';

import { ProgressDashboard } from '@/components/dashboard/ProgressDashboard';
import { ThemeProvider } from '@/hooks/useTheme';
import { getBandScoreHistory, getQuestionAttempts, getTestHistory } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

// Regression + spec coverage for the Home redesign: Home's main content is
// now this exact dashboard (components/dashboard/ProgressDashboard.tsx),
// reused as-is by both the Home tab and app/analytics.tsx — so these tests
// exercise the one real implementation directly, the same way a user would
// see it, rather than re-deriving expectations from mocked internals.
jest.mock('@/services/repository', () => ({
  getQuestionAttempts: jest.fn(),
  getTestHistory: jest.fn(),
  getBandScoreHistory: jest.fn(),
}));

// components/ui's barrel pulls in DailyLimitCard, which imports expo-router
// (for its own navigation) — expo-router's real module graph includes an
// ESM-only package Jest's CJS transform can't load. Mocked the same way
// resendConfirmationNotice.test.tsx does, since ProgressDashboard itself
// never calls useRouter.
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

const mockGetQuestionAttempts = getQuestionAttempts as jest.Mock;
const mockGetTestHistory = getTestHistory as jest.Mock;
const mockGetBandScoreHistory = getBandScoreHistory as jest.Mock;

const GOAL = {
  id: 'goal-1',
  userId: 'user-1',
  ieltsType: 'academic' as const,
  currentBand: 6,
  targetBand: 7.5,
  examDate: null,
  weakestSkill: 'writing' as const,
  dailyStudyMinutes: 30,
  isActive: true,
  createdAt: '2026-01-01',
};

function resetStore(overrides: Partial<ReturnType<typeof useAppStore.getState>> = {}) {
  useAppStore.setState({
    userId: 'user-1',
    profile: { id: 'user-1', fullName: 'Alex', avatarUrl: null, createdAt: '2026-01-01' },
    goal: null,
    bandScores: {},
    subscription: null, // subscription: null resolves to isPremium=true (only an explicit 'free' plan is not premium)
    streak: { count: 0, lastActiveDate: null },
    ...overrides,
  });
}

async function renderDashboard() {
  // gcTime: 0 lets react-query drop its internal cache/gc timers as soon as
  // the component unmounts, instead of leaving them scheduled for the
  // default 5 minutes — otherwise Jest hangs waiting for open handles after
  // every test in this file.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ProgressDashboard onSetGoal={jest.fn()} onUpgrade={jest.fn()} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

describe('ProgressDashboard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('user with a goal and real progress: shows target readiness, real skill bands, and real accuracy/streak/questions stats', async () => {
    resetStore({
      goal: GOAL,
      bandScores: { overall: 6.5, reading: 7, listening: 6.5, writing: 6, speaking: 6 },
      streak: { count: 5, lastActiveDate: '2026-01-05' },
    });
    mockGetQuestionAttempts.mockResolvedValue([
      { id: 'a1', questionId: 'q1', isCorrect: true },
      { id: 'a2', questionId: 'q2', isCorrect: false },
    ]);
    mockGetTestHistory.mockResolvedValue([]);
    mockGetBandScoreHistory.mockResolvedValue([]);

    const { getByText, getAllByText, queryByText } = await renderDashboard();

    // "50%" appears twice by design: the overall-accuracy tile, and the
    // per-question-type breakdown (both attempts map to the same unknown
    // type here) — both are real, not a duplicate render.
    await waitFor(() => expect(getAllByText('50%').length).toBeGreaterThan(0));
    expect(getByText('🔥 5')).toBeTruthy();
    expect(getByText('2')).toBeTruthy(); // questions done
    expect(getByText(/Predicted band 6\.5 of target 7\.5/)).toBeTruthy();
    expect(getByText('7.0')).toBeTruthy(); // reading band card
    // A goal already exists — no setup CTA for it.
    expect(queryByText('Set up my goal')).toBeNull();
  });

  it('user without a goal but with real progress: the target card shows a setup CTA, but skill bands/accuracy/streak/questions are unaffected', async () => {
    resetStore({
      goal: null,
      bandScores: { overall: 6.5, reading: 7, listening: 6.5, writing: 6, speaking: 6 },
      streak: { count: 5, lastActiveDate: '2026-01-05' },
    });
    mockGetQuestionAttempts.mockResolvedValue([{ id: 'a1', questionId: 'q1', isCorrect: true }]);
    mockGetTestHistory.mockResolvedValue([]);
    mockGetBandScoreHistory.mockResolvedValue([]);

    const { getByText, getAllByText } = await renderDashboard();

    expect(getByText('Set up my goal')).toBeTruthy();
    expect(getByText('Set a target band and exam date to track your readiness here.')).toBeTruthy();
    // Real analytics from completed practice must still render — a missing
    // goal only affects the one goal-specific card. "100%" appears twice by
    // design here (overall-accuracy tile + the single question-type row).
    await waitFor(() => expect(getAllByText('100%').length).toBeGreaterThan(0));
    expect(getByText('🔥 5')).toBeTruthy();
    expect(getByText('7.0')).toBeTruthy();
  });

  it('a genuinely new user with no goal and no activity: shows every empty state, never fabricated numbers', async () => {
    resetStore({ goal: null, bandScores: {}, streak: { count: 0, lastActiveDate: null } });
    mockGetQuestionAttempts.mockResolvedValue([]);
    mockGetTestHistory.mockResolvedValue([]);
    mockGetBandScoreHistory.mockResolvedValue([]);

    const { getByText, getAllByText } = await renderDashboard();

    expect(getByText('Set up my goal')).toBeTruthy();
    await waitFor(() => expect(getByText('0%')).toBeTruthy());
    expect(getByText('🔥 0')).toBeTruthy();
    expect(getAllByText('—').length).toBeGreaterThan(0); // skill band cards with no score yet
    await waitFor(() => expect(getByText('Submit a writing task to see a breakdown by criterion.')).toBeTruthy());
    expect(getByText('Complete a speaking session to see a breakdown by criterion.')).toBeTruthy();
    expect(getByText('Answer some practice questions to see a breakdown by question type.')).toBeTruthy();
  });

  it('an analytics query failure surfaces a visible notice instead of silently showing a fabricated 0%/empty state', async () => {
    resetStore({ goal: GOAL, bandScores: {}, streak: { count: 0, lastActiveDate: null } });
    mockGetQuestionAttempts.mockRejectedValue(new Error('permission denied for table question_attempts'));
    mockGetTestHistory.mockResolvedValue([]);
    mockGetBandScoreHistory.mockResolvedValue([]);

    const { getByText } = await renderDashboard();

    await waitFor(() => expect(getByText("Some progress stats couldn't load")).toBeTruthy());
    expect(getByText(/may be incomplete/)).toBeTruthy();
  });
});
