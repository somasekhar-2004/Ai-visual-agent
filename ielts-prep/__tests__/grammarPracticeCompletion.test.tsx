// Regression coverage for the PRODUCTION STREAK / GAMIFICATION
// IMPLEMENTATION's Grammar completion wiring: before this,
// app/grammar-practice.tsx never called recordDailyActivity() at all —
// finishing a full grammar set didn't count as a qualifying streak day.
// This fires exactly once per completed set (on reaching the results
// screen), never per individual question and never merely for opening the
// screen — verified here rather than assumed from code review, since it's
// wired via a useEffect + ref guard.
//
// Note: this project's @testing-library/react-native version's render()
// AND fireEvent.press() are both async (each awaits an act() internally) —
// every call below is awaited for that reason.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import GrammarPracticeScreen from '@/app/grammar-practice';
import { ThemeProvider } from '@/hooks/useTheme';
import { recordDailyActivity } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

const ONE_QUESTION = [
  {
    id: 'gq-test-1',
    topic: 'Test Topic',
    difficulty: 'easy' as const,
    questionType: 'multiple_choice' as const,
    prompt: 'Pick the correct option.',
    options: ['right', 'wrong'],
    correctAnswer: 'right',
    explanation: 'Because it is right.',
    orderIndex: 1,
  },
];

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ topic: 'Test Topic', mode: undefined }),
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('@/services/repository', () => ({
  listGrammarQuestions: jest.fn(() => ONE_QUESTION),
  weakGrammarTopics: jest.fn(() => []),
  getGrammarQuestionAttempts: jest.fn().mockResolvedValue([]),
  recordGrammarAttempt: jest.fn().mockResolvedValue(undefined),
  recordDailyActivity: jest.fn().mockResolvedValue(undefined),
}));

const recordDailyActivityMock = recordDailyActivity as jest.Mock;

async function renderScreen() {
  useAppStore.setState({ userId: 'user-1' });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GrammarPracticeScreen />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

/** Selects the given option, checks the answer, and — for this one-question
 * fixture — lands directly on the results screen (index+1 === questions.length
 * makes the button read "See results" immediately after checking, per
 * grammar-practice.tsx's own label logic). Presses "See results" too. */
async function answerAndCompleteTheOneQuestionSet(getByText: (text: string) => any, option: string) {
  await fireEvent.press(getByText(option));
  await fireEvent.press(getByText('Check answer'));
  await waitFor(() => expect(getByText('See results')).toBeTruthy());
  await fireEvent.press(getByText('See results'));
}

describe('GrammarPracticeScreen — recordDailyActivity wiring', () => {
  afterEach(() => jest.clearAllMocks());

  it('does not record any activity merely for opening the screen', async () => {
    await renderScreen();
    expect(recordDailyActivityMock).not.toHaveBeenCalled();
  });

  it('does not record activity after answering a question but before reaching the results screen', async () => {
    const { getByText } = await renderScreen();
    await fireEvent.press(getByText('right'));
    await fireEvent.press(getByText('Check answer'));
    await waitFor(() => expect(getByText('Correct')).toBeTruthy());
    expect(recordDailyActivityMock).not.toHaveBeenCalled();
  });

  it('records exactly one activity, with the real XP for the questions answered, once the full (one-question) set is completed', async () => {
    const { getByText } = await renderScreen();
    await answerAndCompleteTheOneQuestionSet(getByText, 'right');

    await waitFor(() => expect(recordDailyActivityMock).toHaveBeenCalledTimes(1));
    expect(recordDailyActivityMock).toHaveBeenCalledWith('user-1', 5); // 1 correct * 5 XP
  });

  it('still records completion (with 0 XP) when every answer in the set was wrong', async () => {
    const { getByText } = await renderScreen();
    await answerAndCompleteTheOneQuestionSet(getByText, 'wrong');

    await waitFor(() => expect(recordDailyActivityMock).toHaveBeenCalledTimes(1));
    expect(recordDailyActivityMock).toHaveBeenCalledWith('user-1', 0);
  });

  it('records a second, genuinely separate completion after "Practice again" — never suppressed by the one-shot guard from the first completion', async () => {
    const { getByText } = await renderScreen();
    await answerAndCompleteTheOneQuestionSet(getByText, 'right');
    await waitFor(() => expect(recordDailyActivityMock).toHaveBeenCalledTimes(1));

    await fireEvent.press(getByText('Practice again'));
    await answerAndCompleteTheOneQuestionSet(getByText, 'right');

    await waitFor(() => expect(recordDailyActivityMock).toHaveBeenCalledTimes(2));
  });
});
