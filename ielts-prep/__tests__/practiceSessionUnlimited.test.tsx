// Regression coverage for the removal of the free daily practice-question
// cap. Reading/Listening Quick Practice used to block a free user at 20
// questions/day (see the "23/20 used today" bug this engagement fixed
// earlier, and __tests__/entitlements.test.ts for the local-date-boundary
// coverage that fix left behind) — that whole cap is now gone, for EVERY
// free user including one who already hit 20+ before this session even
// started. These tests prove a free user can submit the 21st answer (and
// beyond) and keep going, with no "Daily limit reached" screen ever shown,
// while attempts keep being recorded exactly as before (tracking, accuracy,
// and resume position are unaffected by removing the cap — only the block
// itself is gone).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import PracticeSessionScreen from '@/app/practice-session';
import { ThemeProvider } from '@/hooks/useTheme';
import { getQuestionAttempts, recordQuestionAttempt } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

const mockQuestions = Array.from({ length: 25 }, (_, i) => ({
  id: `q-${i + 1}`,
  skill: 'reading' as const,
  questionType: 'multiple_choice' as const,
  topic: null,
  difficulty: 'easy' as const,
  estimatedBand: null,
  prompt: `q-${i + 1}`,
  passageId: null,
  listeningTrackId: null,
  options: ['right', 'wrong'],
  correctAnswer: 'right',
  explanation: null,
  strategyNote: null,
  tags: [],
  estimatedTimeSeconds: 30,
  orderIndex: i,
  isPremium: false,
}));

const TODAY_ISO = new Date().toISOString();

/** `n` pre-existing attempts from "today", on question ids NOT in
 * mockQuestions — standing in for usage already recorded elsewhere (other
 * filters, other sessions earlier today). Used here to put a free user
 * PAST the old 20/day cap before the session even renders. */
function priorAttemptsToday(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `prior-${i}`,
    userId: 'user-1',
    questionId: `other-question-${i}`,
    selectedAnswer: 'x',
    isCorrect: true,
    timeSpentSeconds: 10,
    practiceSessionId: null,
    createdAt: TODAY_ISO,
  }));
}

jest.mock('expo-audio', () => ({
  useAudioPlayer: () => ({ play: jest.fn(), pause: jest.fn(), seekTo: jest.fn() }),
  useAudioPlayerStatus: () => ({ playing: false, currentTime: 0, duration: 0 }),
}));

const mockUseLocalSearchParams = jest.fn(() => ({ skill: 'reading' }));
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

jest.mock('@/lib/confirm', () => ({ confirmAsync: jest.fn().mockResolvedValue(true) }));

jest.mock('@/services/repository', () => ({
  listQuestions: jest.fn(() => mockQuestions),
  getQuestionAttempts: jest.fn().mockResolvedValue([]),
  getBookmarks: jest.fn().mockResolvedValue([]),
  recordQuestionAttempt: jest.fn().mockResolvedValue(undefined),
  toggleQuestionBookmark: jest.fn().mockResolvedValue(undefined),
  recordDailyActivity: jest.fn().mockResolvedValue(undefined),
}));

async function renderScreen() {
  // Free plan, specifically — this is the plan the old cap applied to.
  // `isPremium` is derived from `subscription?.plan !== 'free'`, so a free
  // user must be a real free-plan subscription object, not a default-null
  // one (which would read as premium).
  useAppStore.setState({
    userId: 'user-1',
    subscription: { id: 's1', userId: 'user-1', plan: 'free', status: 'none', revenuecatCustomerId: null, currentPeriodEnd: null },
    refreshUserData: jest.fn().mockResolvedValue(undefined),
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PracticeSessionScreen />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

async function answerCurrentQuestion(getByText: (text: string) => any) {
  await fireEvent.press(getByText('right'));
  await fireEvent.press(getByText('Check answer'));
  await waitFor(() => expect(getByText('Correct!')).toBeTruthy());
}

describe('PracticeSessionScreen — Reading/Listening Quick Practice is unlimited for free users', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({ skill: 'reading' });
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  it('a free user already at 20 attempts today is shown a question immediately, not a limit screen', async () => {
    (getQuestionAttempts as jest.Mock).mockResolvedValue(priorAttemptsToday(20));
    const { getByText, queryByText } = await renderScreen();
    await waitFor(() => expect(getByText('q-1')).toBeTruthy());
    expect(queryByText('Daily Practice questions limit reached')).toBeNull();
    expect(queryByText(/used today/)).toBeNull();
  });

  it('a free user can submit question 21 (and keep going past it) with no limit screen ever appearing', async () => {
    (getQuestionAttempts as jest.Mock).mockResolvedValue(priorAttemptsToday(20)); // already 20 used today, elsewhere
    const { getByText, queryByText } = await renderScreen();
    await waitFor(() => expect(getByText('q-1')).toBeTruthy());

    // This is the 21st attempt of the day — under the old cap this would
    // have been blocked before ever reaching a question. It must now go
    // through exactly like any other answer.
    await answerCurrentQuestion(getByText);
    expect(recordQuestionAttempt as jest.Mock).toHaveBeenCalledTimes(1);
    expect(queryByText('Daily Practice questions limit reached')).toBeNull();

    await fireEvent.press(getByText('Next question'));
    await waitFor(() => expect(getByText('q-2')).toBeTruthy());
    expect(queryByText('Daily Practice questions limit reached')).toBeNull();

    // Keep going well past the old cap (22nd, 23rd, 24th, 25th of the day)
    // — tracking keeps working (recordQuestionAttempt called every time)
    // and the session's own position keeps advancing normally.
    await answerCurrentQuestion(getByText);
    await fireEvent.press(getByText('Next question'));
    await waitFor(() => expect(getByText('q-3')).toBeTruthy());
    await answerCurrentQuestion(getByText);
    await fireEvent.press(getByText('Next question'));
    await waitFor(() => expect(getByText('q-4')).toBeTruthy());

    expect(recordQuestionAttempt as jest.Mock).toHaveBeenCalledTimes(3);
    expect(queryByText('Daily Practice questions limit reached')).toBeNull();
  });

  it('a free user with a much larger backlog (50 prior attempts today) is never blocked either', async () => {
    (getQuestionAttempts as jest.Mock).mockResolvedValue(priorAttemptsToday(50));
    const { getByText, queryByText } = await renderScreen();
    await waitFor(() => expect(getByText('q-1')).toBeTruthy());
    await answerCurrentQuestion(getByText);
    expect(recordQuestionAttempt as jest.Mock).toHaveBeenCalledTimes(1);
    expect(queryByText('Daily Practice questions limit reached')).toBeNull();
  });

  it('switching difficulty near the old cap boundary still works, with no limit screen appearing', async () => {
    (getQuestionAttempts as jest.Mock).mockResolvedValue(priorAttemptsToday(20));
    const { getByText, queryByText } = await renderScreen();
    await waitFor(() => expect(getByText('q-1')).toBeTruthy());

    await fireEvent.press(getByText('medium'));
    await fireEvent.press(getByText('hard'));
    await fireEvent.press(getByText('all'));
    await waitFor(() => expect(getByText('q-1')).toBeTruthy());

    await answerCurrentQuestion(getByText);
    expect(recordQuestionAttempt as jest.Mock).toHaveBeenCalledTimes(1);
    expect(queryByText('Daily Practice questions limit reached')).toBeNull();
  });

  it('a rapid double-tap on Check answer still never consumes two attempts for one answer (unrelated to the removed cap)', async () => {
    (getQuestionAttempts as jest.Mock).mockResolvedValue(priorAttemptsToday(20));
    const { getByText } = await renderScreen();
    await waitFor(() => expect(getByText('q-1')).toBeTruthy());

    await fireEvent.press(getByText('right'));
    // Two presses before awaiting either — the closest this environment
    // can get to a genuine rapid double-tap landing before React re-renders
    // to remove the button.
    fireEvent.press(getByText('Check answer'));
    await fireEvent.press(getByText('Check answer'));
    await waitFor(() => expect(getByText('Correct!')).toBeTruthy());

    expect(recordQuestionAttempt as jest.Mock).toHaveBeenCalledTimes(1);
  });
});
