// Regression coverage for the quick-practice streak bug: answering and
// saving questions (recordQuestionAttempt succeeding) did not qualify the
// day for the streak at all unless the user reached the END of the
// (potentially very long, unfiltered) unanswered question pool and tapped
// through to "Finish" — a tester who answered 7, then 8 more, without ever
// seeing "Finish" got zero streak credit no matter how many times the app
// was restarted. app/practice-session.tsx now calls recordDailyActivity
// (0 XP, just to qualify today) the moment the FIRST answer in a session
// is actually saved, separately from the existing finish-time call that
// still awards the session's real XP — see that file's own comments.
//
// Note: this project's @testing-library/react-native version's render()
// AND fireEvent.press() are both async — every call below is awaited.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import PracticeSessionScreen from '@/app/practice-session';
import { ThemeProvider } from '@/hooks/useTheme';
import { recordDailyActivity, recordQuestionAttempt } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

// Five questions — deliberately more than "a couple", so answering just one
// or two and leaving is clearly distinct from reaching the natural end of
// the pool at index 5.
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

// practice-session.tsx statically imports TranscriptAudioPlayer (for the
// listening-track panel), which statically imports expo-audio — needed
// here purely to satisfy that import chain at module-load time. None of
// the fixture questions below have a listeningTrackId, so that panel is
// never actually rendered or exercised in these tests.
jest.mock('expo-audio', () => ({
  useAudioPlayer: () => ({ play: jest.fn(), pause: jest.fn(), seekTo: jest.fn() }),
  useAudioPlayerStatus: () => ({ playing: false, currentTime: 0, duration: 0 }),
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ skill: 'reading' }),
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

jest.mock('@/services/repository', () => ({
  listQuestions: jest.fn(() => MOCK_FIVE_QUESTIONS),
  getQuestionAttempts: jest.fn().mockResolvedValue([]),
  getBookmarks: jest.fn().mockResolvedValue([]),
  recordQuestionAttempt: jest.fn().mockResolvedValue(undefined),
  toggleQuestionBookmark: jest.fn().mockResolvedValue(undefined),
  recordDailyActivity: jest.fn().mockResolvedValue(undefined),
}));

const recordDailyActivityMock = recordDailyActivity as jest.Mock;
const recordQuestionAttemptMock = recordQuestionAttempt as jest.Mock;

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

/** Answers the CURRENT question (always with the correct option, "right",
 * present in every fixture question above) by selecting it and tapping
 * "Check answer". Leaves the resulting "Next question"/"Finish" button
 * unpressed — the caller decides whether to advance. */
async function answerCurrentQuestion(getByText: (text: string) => any) {
  await fireEvent.press(getByText('right'));
  await fireEvent.press(getByText('Check answer'));
  await waitFor(() => expect(getByText('Correct!')).toBeTruthy());
}

describe('PracticeSessionScreen — streak qualification', () => {
  afterEach(() => jest.clearAllMocks());

  it('does not record any activity merely for opening the screen or viewing the first question', async () => {
    await renderScreen();
    expect(recordDailyActivityMock).not.toHaveBeenCalled();
  });

  it('qualifies today for the streak (0 XP) the moment the FIRST question is answered and saved — well before reaching Finish', async () => {
    const { getByText } = await renderScreen();
    await answerCurrentQuestion(getByText);

    await waitFor(() => expect(recordDailyActivityMock).toHaveBeenCalledWith('user-1', 0));
    // The question attempt itself was genuinely saved first — proving this
    // isn't a false pass from the answer never actually being recorded.
    expect(recordQuestionAttemptMock).toHaveBeenCalledWith('user-1', 'q-1', 'right', true, 30);
    // Still only on question 1 of 5 — nowhere near the end of the pool,
    // and "Next question" (not "Finish") is still showing.
    expect(getByText('Next question')).toBeTruthy();
  });

  it('answering a second and third question the same session does not call recordDailyActivity again (one qualifying call per session, same as the server-side upsert is a no-op for the day either way)', async () => {
    const { getByText } = await renderScreen();
    await answerCurrentQuestion(getByText);
    expect(recordDailyActivityMock).toHaveBeenCalledTimes(1);

    await fireEvent.press(getByText('Next question'));
    await answerCurrentQuestion(getByText);
    await fireEvent.press(getByText('Next question'));
    await answerCurrentQuestion(getByText);

    expect(recordDailyActivityMock).toHaveBeenCalledTimes(1);
  });

  it('leaving after answering only 2 of 5 questions (never reaching Finish) still leaves the day qualified — the earlier call already happened and is never undone', async () => {
    const { getByText } = await renderScreen();
    await answerCurrentQuestion(getByText);
    await fireEvent.press(getByText('Next question'));
    await answerCurrentQuestion(getByText);

    // Never pressed "Next question" a second time, never reached "Finish" —
    // the qualifying call from question 1 already fired and is the only one
    // this session needed.
    expect(recordDailyActivityMock).toHaveBeenCalledTimes(1);
    expect(recordDailyActivityMock).toHaveBeenCalledWith('user-1', 0);
    expect(getByText('Next question')).toBeTruthy();
  });

  it('finishing the full set still awards the real session XP on top of the earlier 0-XP qualifying call — scoring is unchanged', async () => {
    const { getByText } = await renderScreen();
    for (let i = 0; i < 5; i++) {
      await answerCurrentQuestion(getByText);
      await fireEvent.press(getByText(i < 4 ? 'Next question' : 'Finish'));
    }

    await waitFor(() => expect(recordDailyActivityMock).toHaveBeenCalledTimes(2));
    expect(recordDailyActivityMock).toHaveBeenNthCalledWith(1, 'user-1', 0); // the qualifying call, from question 1
    expect(recordDailyActivityMock).toHaveBeenNthCalledWith(2, 'user-1', 25); // 5 correct answers * 5 XP, exactly as before this change
  });
});
