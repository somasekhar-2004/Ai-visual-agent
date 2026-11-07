// Regression coverage for a real bug: leaving Practice after answering
// several questions and coming back started over at question 1 — there
// was no persistence of progress at all (app/practice-session.tsx's
// `index`/`results` were plain component state, reset to 0/[] on every
// fresh mount). These tests exercise the AsyncStorage-backed resume added
// to fix that: unmounting and re-rendering the screen (a fresh render
// tree, QueryClient and store, with only AsyncStorage retained — the
// closest approximation of "the user left and came back" this test
// environment can produce) resumes at the next unanswered question.
//
// IMPORTANT: this is NOT a literal Android force-stop / cold-start test —
// it proves the resume logic's own storage/hydration behavior in this
// test environment, not that the originally reported on-device bug is
// conclusively fixed. That still needs a real device/emulator check.
//
// Note: this project's @testing-library/react-native version's render()
// AND fireEvent.press() are both async — every call below is awaited.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import PracticeSessionScreen from '@/app/practice-session';
import { ThemeProvider } from '@/hooks/useTheme';
import { getQuestionAttempts, recordQuestionAttempt } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

const MOCK_FIVE_QUESTIONS = Array.from({ length: 5 }, (_, i) => ({
  id: `q-${i + 1}`,
  skill: 'reading' as const,
  questionType: 'multiple_choice' as const,
  topic: null,
  difficulty: 'easy' as const,
  estimatedBand: null,
  prompt: `Question ${i + 1}`,
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

jest.mock('expo-audio', () => ({
  useAudioPlayer: () => ({ play: jest.fn(), pause: jest.fn(), seekTo: jest.fn() }),
  useAudioPlayerStatus: () => ({ playing: false, currentTime: 0, duration: 0 }),
}));

const mockUseLocalSearchParams = jest.fn(() => ({ skill: 'reading' }));
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

const mockConfirmAsync = jest.fn().mockResolvedValue(true);
jest.mock('@/lib/confirm', () => ({ confirmAsync: (...args: unknown[]) => mockConfirmAsync(...args) }));

jest.mock('@/services/repository', () => ({
  listQuestions: jest.fn(() => MOCK_FIVE_QUESTIONS),
  getQuestionAttempts: jest.fn().mockResolvedValue([]),
  getBookmarks: jest.fn().mockResolvedValue([]),
  recordQuestionAttempt: jest.fn().mockResolvedValue(undefined),
  toggleQuestionBookmark: jest.fn().mockResolvedValue(undefined),
  recordDailyActivity: jest.fn().mockResolvedValue(undefined),
}));

async function renderScreen() {
  useAppStore.setState({ userId: 'user-1', refreshUserData: jest.fn().mockResolvedValue(undefined) });
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

describe('PracticeSessionScreen — resuming progress after leaving and returning', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockConfirmAsync.mockResolvedValue(true);
    mockUseLocalSearchParams.mockReturnValue({ skill: 'reading' });
    await AsyncStorage.clear();
  });

  // handleAnswered's streak-qualifying call is deliberately fire-and-forget
  // (see its own comment in practice-session.tsx) — it can still be
  // in-flight when a test's assertions finish. Draining the microtask
  // queue between tests lets it settle before the next test's render
  // starts, instead of resolving mid-way through an unrelated test and
  // tripping React's "update not wrapped in act()" warnings.
  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  it('a fresh session shows no Restart control and starts at question 1', async () => {
    const { getByText, queryByLabelText, unmount } = await renderScreen();
    await waitFor(() => expect(getByText('Question 1 of 5')).toBeTruthy());
    expect(queryByLabelText('Restart')).toBeNull();
    unmount();
  });

  it('resumes at the next unanswered question (not question 1) after unmounting and rendering fresh — simulating leaving and returning', async () => {
    const first = await renderScreen();
    await waitFor(() => expect(first.getByText('Question 1 of 5')).toBeTruthy());
    await answerCurrentQuestion(first.getByText);
    await fireEvent.press(first.getByText('Next question'));
    await answerCurrentQuestion(first.getByText);
    // Deliberately never presses "Next question" here — leaves mid-way,
    // the same way backgrounding/closing the app would, with 2 of 5
    // answered and the second answer's "Next question" button still on
    // screen but unpressed.
    await waitFor(() => expect(first.getByText('Next question')).toBeTruthy());
    first.unmount();
    // See the shared afterEach below for why this settle delay matters —
    // here it's needed between the two renders inside this same test,
    // not just between tests.
    await new Promise((resolve) => setTimeout(resolve, 50));

    // A completely fresh render tree, QueryClient and store — only
    // AsyncStorage carries over, the same way a real app restart would
    // leave the in-memory Zustand/React Query state gone but the device's
    // persisted storage intact.
    const second = await renderScreen();

    await waitFor(() => expect(second.getByText('Question 3 of 5')).toBeTruthy());
    expect(second.queryByText('Question 1 of 5')).toBeNull();
    second.unmount();
  });

  it('a different session (different skill) never resumes into another session\'s saved progress', async () => {
    const reading = await renderScreen();
    await waitFor(() => expect(reading.getByText('Question 1 of 5')).toBeTruthy());
    await answerCurrentQuestion(reading.getByText);
    await fireEvent.press(reading.getByText('Next question'));
    await waitFor(() => expect(reading.getByText('Question 2 of 5')).toBeTruthy());
    reading.unmount();
    await new Promise((resolve) => setTimeout(resolve, 50)); // see the shared afterEach below

    mockUseLocalSearchParams.mockReturnValue({ skill: 'listening' });
    const listening = await renderScreen();

    await waitFor(() => expect(listening.getByText('Question 1 of 5')).toBeTruthy());
    listening.unmount();
  });

  it('shows a confirmed Restart control once there is progress, and it clears saved progress back to question 1', async () => {
    const { getByText, queryByLabelText, getByLabelText, unmount } = await renderScreen();
    await waitFor(() => expect(getByText('Question 1 of 5')).toBeTruthy());
    await answerCurrentQuestion(getByText);
    await fireEvent.press(getByText('Next question'));
    await waitFor(() => expect(getByText('Question 2 of 5')).toBeTruthy());

    const restart = await waitFor(() => getByLabelText('Restart'));
    await fireEvent.press(restart);
    expect(mockConfirmAsync).toHaveBeenCalled();
    await waitFor(() => expect(getByText('Question 1 of 5')).toBeTruthy());
    expect(queryByLabelText('Restart')).toBeNull();
    unmount();
    await new Promise((resolve) => setTimeout(resolve, 50)); // see the shared afterEach below

    // The reset must actually persist — re-rendering fresh afterward must
    // not resurrect the progress that was just cleared.
    const resumed = await renderScreen();
    await waitFor(() => expect(resumed.getByText('Question 1 of 5')).toBeTruthy());
    resumed.unmount();
  });

  it('declining the Restart confirmation leaves saved progress untouched', async () => {
    mockConfirmAsync.mockResolvedValue(false);
    const { getByText, getByLabelText, unmount } = await renderScreen();
    await waitFor(() => expect(getByText('Question 1 of 5')).toBeTruthy());
    await answerCurrentQuestion(getByText);
    await fireEvent.press(getByText('Next question'));
    await waitFor(() => expect(getByText('Question 2 of 5')).toBeTruthy());

    await fireEvent.press(getByLabelText('Restart'));
    expect(mockConfirmAsync).toHaveBeenCalled();
    // Still on question 2 — declining the confirmation must not reset anything.
    expect(getByText('Question 2 of 5')).toBeTruthy();
    expect(recordQuestionAttempt as jest.Mock).toHaveBeenCalledTimes(1);
    unmount();
  });
});

// Regression coverage for a real bug found on a real device: uninstalling
// and reinstalling the app wipes AsyncStorage along with everything else
// local, but the account's real question_attempts on the server survive.
// Home correctly kept the lifetime completed-question count after a
// reinstall; Quick Practice did not — it only ever checked AsyncStorage, so
// it always restarted at Question 1 regardless of real server progress.
// These tests simulate that exact state: AsyncStorage genuinely empty (the
// shared beforeEach above already clears it) while getQuestionAttempts
// returns real attempt rows, as it would right after signing back into the
// same account on a fresh install.
describe('PracticeSessionScreen — resuming via the server when there is no local (AsyncStorage) save at all', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockConfirmAsync.mockResolvedValue(true);
    mockUseLocalSearchParams.mockReturnValue({ skill: 'reading' });
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50)); // see the shared afterEach above
  });

  it('resumes at the next unanswered question using real question_attempts rows, matched by question id', async () => {
    (getQuestionAttempts as jest.Mock).mockResolvedValueOnce([
      { id: 'a1', userId: 'user-1', questionId: 'q-1', selectedAnswer: 'right', isCorrect: true, timeSpentSeconds: 10, practiceSessionId: null, createdAt: '2026-11-01T00:00:00Z' },
      { id: 'a2', userId: 'user-1', questionId: 'q-2', selectedAnswer: 'wrong', isCorrect: false, timeSpentSeconds: 10, practiceSessionId: null, createdAt: '2026-11-01T00:01:00Z' },
    ]);
    const { getByText, queryByText } = await renderScreen();
    await waitFor(() => expect(getByText('Question 3 of 5')).toBeTruthy());
    expect(queryByText('Question 1 of 5')).toBeNull();
  });

  it('never infers a resume point from an unrelated lifetime attempt count — unmatched question ids never advance the index', async () => {
    // 23 real attempts — none of them for any question in THIS screen's
    // list (a different skill/filter entirely) — must never be read as
    // "23 completed, so start at Q24" or advance the index at all.
    (getQuestionAttempts as jest.Mock).mockResolvedValueOnce(
      Array.from({ length: 23 }, (_, i) => ({
        id: `other-${i}`,
        userId: 'user-1',
        questionId: `other-question-${i}`,
        selectedAnswer: 'x',
        isCorrect: true,
        timeSpentSeconds: 10,
        practiceSessionId: null,
        createdAt: '2026-11-01T00:00:00Z',
      }))
    );
    const { getByText } = await renderScreen();
    await waitFor(() => expect(getByText('Question 1 of 5')).toBeTruthy());
  });

  it('Restart still works after a server-side resume', async () => {
    (getQuestionAttempts as jest.Mock).mockResolvedValue([
      { id: 'a1', userId: 'user-1', questionId: 'q-1', selectedAnswer: 'right', isCorrect: true, timeSpentSeconds: 10, practiceSessionId: null, createdAt: '2026-11-01T00:00:00Z' },
    ]);
    const { getByText, getByLabelText } = await renderScreen();
    await waitFor(() => expect(getByText('Question 2 of 5')).toBeTruthy());

    const restart = await waitFor(() => getByLabelText('Restart'));
    await fireEvent.press(restart);
    expect(mockConfirmAsync).toHaveBeenCalled();
    await waitFor(() => expect(getByText('Question 1 of 5')).toBeTruthy());
  });
});
