// Regression coverage for a real report on v26: after answering "many"
// questions, Home's "Questions done" stat (84) grew far more than the
// Reading practice card's count (25 -> 28). Both numbers turned out to be
// correct, just measuring different things:
//   - Home's count (components/dashboard/ProgressDashboard.tsx) is every
//     question_attempts ROW ever recorded for the user — a lifetime total
//     that legitimately includes the SAME question answered twice, because
//     switchDifficulty() in app/practice-session.tsx is deliberately pure
//     navigation: each difficulty filter ("all", "easy", "medium", "hard")
//     remembers its own answered-questions map independently, so a question
//     answered once under "all" and again under "easy" is two real,
//     separately-recorded attempts.
//   - The Practice tab's per-skill card (app/(tabs)/practice.tsx) counts
//     DISTINCT question ids attempted, intersected with that skill's full
//     question bank — re-answering the same question under a different
//     difficulty filter must never inflate this number.
// This test proves both halves hold under the exact two cases asked for —
// a brand-new question, then that same question again under a different
// difficulty filter — AND that the Practice tab's card reflects the right
// number immediately on return, with no app restart, using the same
// per-answer invalidateQueries(['question-attempts', userId]) wired up for
// the "23/20" fix. It does NOT assert on the caption wording itself (that's
// just a label) — it asserts on the numbers those labels describe.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import PracticeHubScreen from '@/app/(tabs)/practice';
import PracticeSessionScreen from '@/app/practice-session';
import { ProgressDashboard } from '@/components/dashboard/ProgressDashboard';
import { ThemeProvider } from '@/hooks/useTheme';
import { recordQuestionAttempt } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import type { QuestionAttempt } from '@/types/models';

const mockReadingQuestions = Array.from({ length: 5 }, (_, i) => ({
  id: `read-${i + 1}`,
  skill: 'reading' as const,
  questionType: 'multiple_choice' as const,
  topic: null,
  difficulty: 'easy' as const, // every question shares one difficulty on
  // purpose: it's what makes the "all" filter and the "easy" filter contain
  // the EXACT same question at the exact same position, so switching
  // difficulty genuinely re-presents the same question rather than a
  // different one that happens to share a filter.
  estimatedBand: null,
  prompt: `read-${i + 1}`,
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

const mockListeningQuestions = [
  {
    id: 'listen-1',
    skill: 'listening' as const,
    questionType: 'multiple_choice' as const,
    topic: null,
    difficulty: 'easy' as const,
    estimatedBand: null,
    prompt: 'listen-1',
    passageId: null,
    listeningTrackId: null,
    options: ['right', 'wrong'],
    correctAnswer: 'right',
    explanation: null,
    strategyNote: null,
    tags: [],
    estimatedTimeSeconds: 30,
    orderIndex: 0,
    isPremium: false,
  },
];

// A real, mutable in-memory question_attempts table — recordQuestionAttempt
// appends to it and getQuestionAttempts always reads the current contents,
// exactly like the real Supabase round-trip handleAnswered's
// invalidateQueries triggers.
let mockAttemptsTable: QuestionAttempt[] = [];

jest.mock('expo-audio', () => ({
  useAudioPlayer: () => ({ play: jest.fn(), pause: jest.fn(), seekTo: jest.fn() }),
  useAudioPlayerStatus: () => ({ playing: false, currentTime: 0, duration: 0 }),
}));

const mockUseLocalSearchParams = jest.fn(() => ({ skill: 'reading' }));
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() }),
  useFocusEffect: (cb: () => void) => cb(),
}));

jest.mock('@/lib/confirm', () => ({ confirmAsync: jest.fn().mockResolvedValue(true) }));

jest.mock('@/services/repository', () => ({
  listQuestions: jest.fn(({ skill, difficulty }: { skill?: string; difficulty?: string } = {}) => {
    let list: any[] = skill === 'listening' ? mockListeningQuestions : mockReadingQuestions;
    if (difficulty) list = list.filter((q) => q.difficulty === difficulty);
    return list;
  }),
  getQuestionAttempts: jest.fn(() => Promise.resolve([...mockAttemptsTable])),
  getBookmarks: jest.fn().mockResolvedValue([]),
  recordQuestionAttempt: jest.fn((userId: string, questionId: string, selectedAnswer: string | null, isCorrect: boolean) => {
    mockAttemptsTable.push({
      id: `a-${mockAttemptsTable.length + 1}`,
      userId,
      questionId,
      selectedAnswer,
      isCorrect,
      timeSpentSeconds: 10,
      practiceSessionId: null,
      createdAt: new Date().toISOString(),
    });
    return Promise.resolve(undefined);
  }),
  toggleQuestionBookmark: jest.fn().mockResolvedValue(undefined),
  recordDailyActivity: jest.fn().mockResolvedValue(undefined),
  getTestHistory: jest.fn().mockResolvedValue([]),
  getBandScoreHistory: jest.fn().mockResolvedValue([]),
}));

async function answerCurrentQuestion(getByText: (text: string) => any) {
  await fireEvent.press(getByText('right'));
  await fireEvent.press(getByText('Check answer'));
  await waitFor(() => expect(getByText('Correct!')).toBeTruthy());
}

describe('Practice-question counters — Home\'s lifetime total vs. the Practice tab\'s unique-question count', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockAttemptsTable = [];
    await AsyncStorage.clear();
    mockUseLocalSearchParams.mockReturnValue({ skill: 'reading' });
    // Free plan: keeps ProgressDashboard to its 3 basic stat cards (no
    // premium-only "Activities (7/30 days)"/"Minutes studied" stats, which
    // also start at 0 and would make `getByText('0')` ambiguous below).
    // Only 2 questions get answered in this test, far under the free daily
    // cap (already covered by __tests__/practiceSessionDailyLimit.test.tsx).
    useAppStore.setState({
      userId: 'user-1',
      subscription: { id: 's1', userId: 'user-1', plan: 'free', status: 'none', revenuecatCustomerId: null, currentPeriodEnd: null },
      goal: null,
      bandScores: {},
      // A non-zero, non-colliding value — ProgressDashboard renders this as
      // a separate "🔥 {streak.count}" text node, which would otherwise
      // ambiguously match the same `getByText('0')`/`getByText('1')`
      // queries this test uses for the "Total attempts" stat below.
      streak: { count: 7, lastActiveDate: null },
      refreshUserData: jest.fn().mockResolvedValue(undefined),
    });
  });

  it('a brand-new question raises both counters by 1; re-answering it under another difficulty raises only the lifetime total', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });

    const hub = await render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <PracticeHubScreen />
        </ThemeProvider>
      </QueryClientProvider>
    );
    const dashboard = await render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ProgressDashboard onSetGoal={jest.fn()} onUpgrade={jest.fn()} />
        </ThemeProvider>
      </QueryClientProvider>
    );

    // Starting point: nothing attempted yet.
    await waitFor(() => expect(hub.getByText(/0 of 5 unique Reading questions attempted/)).toBeTruthy());
    await waitFor(() => expect(dashboard.getByText('0')).toBeTruthy());

    const session = await render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <PracticeSessionScreen />
        </ThemeProvider>
      </QueryClientProvider>
    );
    await waitFor(() => expect(session.getByText('read-1')).toBeTruthy());

    // Case 1: answer a previously-unseen Reading question (read-1, under the
    // default "all" difficulty filter).
    await answerCurrentQuestion(session.getByText);
    expect(recordQuestionAttempt as jest.Mock).toHaveBeenCalledTimes(1);
    expect(mockAttemptsTable.map((a) => a.questionId)).toEqual(['read-1']);

    // "Return to Practice" — the hub screen was never unmounted (exactly
    // like a persistent tab), and must reflect the new count without any
    // extra action from this test beyond what handleAnswered's own
    // invalidateQueries already triggers.
    await waitFor(() => expect(hub.getByText(/1 of 5 unique Reading questions attempted/)).toBeTruthy());
    await waitFor(() => expect(dashboard.getByText('1')).toBeTruthy());

    // Case 2: switch to the "easy" difficulty filter — read-1 is itself
    // tagged "easy", so it reappears as question 1 of that filter's own
    // (independently-tracked) progress, genuinely unanswered from THAT
    // filter's point of view. Answering it again here is answering the
    // exact same question a second time, not a different one.
    await fireEvent.press(session.getByText('easy'));
    await waitFor(() => expect(session.getByText('read-1')).toBeTruthy());
    // The "easy" filter's own (independent, empty-so-far) progress must
    // settle before answering again — "read-1" alone isn't a reliable
    // signal here, since it's also the id shown mid-switch for a render or
    // two before the derivation effect (practice-session.tsx) finishes
    // resuming this filter's own results/index. Confirming the question is
    // genuinely fresh from THIS filter's perspective (no leftover "Next
    // question" button from the "all" filter's progress) also doubles as
    // regression coverage for the QuestionCard key fix above: without it,
    // this would be stuck on "Correct!" from the "all"-filter answer
    // forever, with neither Check-answer nor Next-question ever appearing.
    await waitFor(() => expect(session.queryByText('Next question')).toBeNull());
    await waitFor(() => expect(session.queryByText('Correct!')).toBeNull());
    await answerCurrentQuestion(session.getByText);

    expect(recordQuestionAttempt as jest.Mock).toHaveBeenCalledTimes(2);
    expect(mockAttemptsTable.map((a) => a.questionId)).toEqual(['read-1', 'read-1']);

    // The lifetime total (Home) correctly counts both attempts...
    await waitFor(() => expect(dashboard.getByText('2')).toBeTruthy());
    // ...but the unique-question count (Practice tab) must NOT double-count
    // the same question — this is the number that was never meant to move
    // on a same-question re-answer, and must still read exactly 1 of 5.
    await waitFor(() => expect(hub.getByText(/1 of 5 unique Reading questions attempted/)).toBeTruthy());
    expect(hub.queryByText(/2 of 5 unique Reading questions attempted/)).toBeNull();
  });
});
