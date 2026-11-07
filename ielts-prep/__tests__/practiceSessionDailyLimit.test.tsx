// Regression coverage for a real bug reported on v25: the free-plan screen
// showed "23/20 used today" — usage had run past the daily cap entirely.
// Root cause: attemptsQuery only ever refetched once per session (at
// Finish), so the limit check — itself only ever run ONCE, at the very
// start of a session (index === 0 && results.length === 0) — never saw
// usage climb as the user kept answering, and never re-checked again for
// the rest of a long session. These tests prove the fix tapping through
// REAL answers, not by asserting on the pure entitlements helpers alone
// (see __tests__/entitlements.test.ts for those): the 20th answer must be
// allowed, the 21st must be blocked BEFORE it is recorded, and neither a
// difficulty switch nor a rapid double-tap on Check answer may consume an
// extra slot.
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
 * filters, other sessions earlier today), exactly how a real baseline
 * would look. */
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
  // The screen derives isPremium from `subscription?.plan !== 'free'` (see
  // practice-session.tsx) — the store has no standalone `isPremium` field,
  // so a free-plan user must be represented by an actual free-plan
  // subscription object, not a bare `isPremium: false` (which would just
  // set an unused key and leave `subscription` at its default `null`,
  // which reads as PREMIUM: `null?.plan !== 'free'` is `true`).
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

describe('PracticeSessionScreen — the free daily practice-question cap is enforced live, per answer', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({ skill: 'reading' });
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  it('allows the 20th answer of the day and blocks the 21st before it is ever recorded', async () => {
    (getQuestionAttempts as jest.Mock).mockResolvedValue(priorAttemptsToday(19)); // 19 used already today, elsewhere
    const { getByText } = await renderScreen();
    await waitFor(() => expect(getByText('q-1')).toBeTruthy());

    // The 20th answer of the day — must be allowed.
    await answerCurrentQuestion(getByText);
    expect(recordQuestionAttempt as jest.Mock).toHaveBeenCalledTimes(1);

    await fireEvent.press(getByText('Next question'));

    // The 21st would be next — blocked before the question is even shown,
    // let alone answerable.
    await waitFor(() => expect(getByText('Daily Practice questions limit reached')).toBeTruthy());
    expect(getByText(/20\/20 used today/)).toBeTruthy();
    expect(recordQuestionAttempt as jest.Mock).toHaveBeenCalledTimes(1); // still just the 20th
  });

  it('a free user already at 20/20 before starting is blocked immediately, never shown a question', async () => {
    (getQuestionAttempts as jest.Mock).mockResolvedValue(priorAttemptsToday(20));
    const { getByText, queryByText } = await renderScreen();
    await waitFor(() => expect(getByText('Daily Practice questions limit reached')).toBeTruthy());
    expect(queryByText('q-1')).toBeNull();
    expect(recordQuestionAttempt as jest.Mock).not.toHaveBeenCalled();
  });

  it('switching difficulty while near the cap never itself consumes a slot', async () => {
    (getQuestionAttempts as jest.Mock).mockResolvedValue(priorAttemptsToday(19));
    const { getByText } = await renderScreen();
    await waitFor(() => expect(getByText('q-1')).toBeTruthy());

    await fireEvent.press(getByText('medium'));
    await fireEvent.press(getByText('hard'));
    await fireEvent.press(getByText('all'));

    // Still exactly 19 used (baseline) + 0 this session — the 20th
    // question should still be answerable after all that switching.
    await answerCurrentQuestion(getByText);
    expect(recordQuestionAttempt as jest.Mock).toHaveBeenCalledTimes(1);
  });

  it('a rapid double-tap on Check answer never consumes two slots for one answer', async () => {
    (getQuestionAttempts as jest.Mock).mockResolvedValue(priorAttemptsToday(19));
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
