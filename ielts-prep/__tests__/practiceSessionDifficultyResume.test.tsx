// Regression coverage for a real bug reported on v24: switching the
// difficulty chip (All/Easy/Medium/Hard) in Quick Practice reset progress
// back to question 1 instead of remembering where the user left off in
// EACH filter independently. Reproduced exactly as described: Reading,
// around Q25 under "All", tap Medium then All again — showed "Question 1
// of N" instead of returning to Q25. Easy → Hard → Easy had the same
// problem.
//
// Root cause: app/practice-session.tsx's difficulty Chips called
// resetToFreshSession(d) — the SAME "start over" function Restart and
// "Practice again" use — on every tap, unconditionally wiping results/index
// to 0 regardless of the target difficulty. Fixed by giving the chips their
// own switchDifficulty() (pure navigation, no reset) and tracking each
// difficulty's own answered-question-ids separately (answeredByDifficultyRef
// in practice-session.tsx), restored by matching real question ids — never
// a raw array index assumption.
//
// A reopen-only test cannot catch this bug (it never switches difficulty
// within one still-mounted session) — every test below taps the actual
// chips, matching how the bug was actually reproduced.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import PracticeSessionScreen from '@/app/practice-session';
import { ThemeProvider } from '@/hooks/useTheme';
import { listQuestions, recordQuestionAttempt } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

type Difficulty = 'easy' | 'medium' | 'hard';
type Skill = 'reading' | 'listening';

function makeQuestions(skill: Skill, difficulty: Difficulty, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const id = `${skill}-${difficulty}-${i + 1}`;
    return {
      id,
      skill,
      questionType: 'multiple_choice' as const,
      topic: null,
      difficulty,
      estimatedBand: null,
      // The prompt IS the question id — every assertion below just checks
      // which prompt text is on screen to know exactly which question id
      // is showing, with no indirection.
      prompt: id,
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
    };
  });
}

// 3 questions per difficulty per skill — "All" for a skill is these three
// difficulties' questions concatenated in this exact order (easy, medium,
// hard), matching the real listQuestions' filter-only (no reordering)
// semantics mocked below.
const ALL_QUESTIONS = [
  ...makeQuestions('reading', 'easy', 3),
  ...makeQuestions('reading', 'medium', 3),
  ...makeQuestions('reading', 'hard', 3),
  ...makeQuestions('listening', 'easy', 3),
  ...makeQuestions('listening', 'medium', 3),
  ...makeQuestions('listening', 'hard', 3),
];

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
  // Real filtering logic is installed in beforeEach below (jest.mock's
  // factory can't reference the module-scoped ALL_QUESTIONS fixture — it's
  // hoisted above it) — this is just a placeholder jest.fn().
  listQuestions: jest.fn(),
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

describe('PracticeSessionScreen — each difficulty filter remembers its own position (tapping the real chips)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (listQuestions as jest.Mock).mockImplementation((filters: { skill?: Skill; difficulty?: Difficulty } = {}) =>
      ALL_QUESTIONS.filter((q) => (!filters.skill || q.skill === filters.skill) && (!filters.difficulty || q.difficulty === filters.difficulty))
    );
    mockConfirmAsync.mockResolvedValue(true);
    mockUseLocalSearchParams.mockReturnValue({ skill: 'reading' });
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50)); // see practiceSessionResume.test.tsx's shared afterEach for why
  });

  it('Reading: All → Medium → All restores the exact question left on in All, not question 1', async () => {
    const { getByText, queryByText } = await renderScreen();
    await waitFor(() => expect(getByText('reading-easy-1')).toBeTruthy());

    // Answer 2 questions under "All" — now on reading-easy-3 (index 2).
    await answerCurrentQuestion(getByText);
    await fireEvent.press(getByText('Next question'));
    await answerCurrentQuestion(getByText);
    await fireEvent.press(getByText('Next question'));
    await waitFor(() => expect(getByText('reading-easy-3')).toBeTruthy());

    await fireEvent.press(getByText('medium'));
    await waitFor(() => expect(getByText('reading-medium-1')).toBeTruthy());
    expect(queryByText('reading-easy-3')).toBeNull();

    await fireEvent.press(getByText('all'));
    // The actual regression: this used to show "Question 1 of 9" /
    // reading-easy-1 instead of returning to where All was left off.
    await waitFor(() => expect(getByText('reading-easy-3')).toBeTruthy());
    expect(queryByText('Question 1 of 9')).toBeNull();
  });

  it('Reading: Easy → Hard → Easy restores the exact question left on in Easy', async () => {
    const { getByText, queryByText } = await renderScreen();
    await waitFor(() => expect(getByText('reading-easy-1')).toBeTruthy());

    await fireEvent.press(getByText('easy'));
    await answerCurrentQuestion(getByText);
    await fireEvent.press(getByText('Next question'));
    await waitFor(() => expect(getByText('reading-easy-2')).toBeTruthy());

    await fireEvent.press(getByText('hard'));
    await waitFor(() => expect(getByText('reading-hard-1')).toBeTruthy());

    await fireEvent.press(getByText('easy'));
    await waitFor(() => expect(getByText('reading-easy-2')).toBeTruthy());
    expect(queryByText('reading-easy-1')).toBeNull();
  });

  it('Listening: All → Medium → All restores the exact question left on in All', async () => {
    mockUseLocalSearchParams.mockReturnValue({ skill: 'listening' });
    const { getByText, queryByText } = await renderScreen();
    await waitFor(() => expect(getByText('listening-easy-1')).toBeTruthy());

    await answerCurrentQuestion(getByText);
    await fireEvent.press(getByText('Next question'));
    await waitFor(() => expect(getByText('listening-easy-2')).toBeTruthy());

    await fireEvent.press(getByText('medium'));
    await waitFor(() => expect(getByText('listening-medium-1')).toBeTruthy());

    await fireEvent.press(getByText('all'));
    await waitFor(() => expect(getByText('listening-easy-2')).toBeTruthy());
    expect(queryByText('listening-medium-1')).toBeNull();
  });

  it('survives rapid repeated switching without drifting from the right position', async () => {
    const { getByText } = await renderScreen();
    await waitFor(() => expect(getByText('reading-easy-1')).toBeTruthy());
    await answerCurrentQuestion(getByText);
    await fireEvent.press(getByText('Next question'));
    await waitFor(() => expect(getByText('reading-easy-2')).toBeTruthy());

    await fireEvent.press(getByText('medium'));
    await fireEvent.press(getByText('hard'));
    await fireEvent.press(getByText('all'));
    await fireEvent.press(getByText('medium'));
    await fireEvent.press(getByText('all'));

    await waitFor(() => expect(getByText('reading-easy-2')).toBeTruthy());
  });

  it('switching filters never records another attempt or changes the lifetime count', async () => {
    const { getByText } = await renderScreen();
    await waitFor(() => expect(getByText('reading-easy-1')).toBeTruthy());
    await answerCurrentQuestion(getByText);
    expect(recordQuestionAttempt as jest.Mock).toHaveBeenCalledTimes(1);

    await fireEvent.press(getByText('medium'));
    await fireEvent.press(getByText('hard'));
    await fireEvent.press(getByText('all'));

    // Pure navigation — no new attempts recorded just from switching.
    expect(recordQuestionAttempt as jest.Mock).toHaveBeenCalledTimes(1);
  });

  it('each filter position survives leaving and reopening Practice (same install), not just staying mounted', async () => {
    const first = await renderScreen();
    await waitFor(() => expect(first.getByText('reading-easy-1')).toBeTruthy());
    await answerCurrentQuestion(first.getByText);
    await fireEvent.press(first.getByText('Next question'));
    await waitFor(() => expect(first.getByText('reading-easy-2')).toBeTruthy());

    await fireEvent.press(first.getByText('medium'));
    await answerCurrentQuestion(first.getByText);
    await fireEvent.press(first.getByText('Next question'));
    await waitFor(() => expect(first.getByText('reading-medium-2')).toBeTruthy());

    first.unmount();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const second = await renderScreen();
    // Reopens on whichever difficulty was active when it was left (medium).
    await waitFor(() => expect(second.getByText('reading-medium-2')).toBeTruthy());

    await fireEvent.press(second.getByText('all'));
    await waitFor(() => expect(second.getByText('reading-easy-2')).toBeTruthy());
    second.unmount();
  });

  it('Restart clears only the active difficulty, leaving other filters\' remembered positions untouched', async () => {
    const { getByText, getByLabelText, queryByText } = await renderScreen();
    await waitFor(() => expect(getByText('reading-easy-1')).toBeTruthy());
    await answerCurrentQuestion(getByText);
    await fireEvent.press(getByText('Next question'));
    await waitFor(() => expect(getByText('reading-easy-2')).toBeTruthy());

    await fireEvent.press(getByText('medium'));
    await answerCurrentQuestion(getByText);
    await fireEvent.press(getByText('Next question'));
    await waitFor(() => expect(getByText('reading-medium-2')).toBeTruthy());

    const restart = await waitFor(() => getByLabelText('Restart'));
    await fireEvent.press(restart);
    await waitFor(() => expect(getByText('reading-medium-1')).toBeTruthy());

    await fireEvent.press(getByText('all'));
    // "All" was never restarted — still remembers reading-easy-2.
    await waitFor(() => expect(getByText('reading-easy-2')).toBeTruthy());
    expect(queryByText('reading-medium-2')).toBeNull();
  });
});
