import { activityUsedToday, checkDailyLimit, FREE_DAILY_PRACTICE_QUESTIONS, practiceQuestionsUsedToday } from '@/lib/entitlements';
import type { QuestionAttempt, TestHistoryEntry } from '@/types/models';

function attempt(createdAt: string): QuestionAttempt {
  return {
    id: `qa-${createdAt}`,
    userId: 'u1',
    questionId: 'q1',
    selectedAnswer: 'a',
    isCorrect: true,
    timeSpentSeconds: 30,
    practiceSessionId: null,
    createdAt,
  };
}

function historyEntry(activityType: TestHistoryEntry['activityType'], createdAt: string): TestHistoryEntry {
  return { id: `h-${createdAt}`, userId: 'u1', activityType, refId: null, band: null, summary: {}, createdAt };
}

describe('practiceQuestionsUsedToday', () => {
  it('counts only attempts from today', () => {
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const attempts = [attempt(today), attempt(today), attempt(yesterday)];
    expect(practiceQuestionsUsedToday(attempts)).toBe(2);
  });

  it('returns 0 for an empty attempt list', () => {
    expect(practiceQuestionsUsedToday([])).toBe(0);
  });
});

describe('activityUsedToday', () => {
  it('counts only entries of the given activity type from today', () => {
    const today = new Date().toISOString();
    const history = [historyEntry('ai_chat', today), historyEntry('ai_chat', today), historyEntry('writing', today)];
    expect(activityUsedToday(history, 'ai_chat')).toBe(2);
  });

  it('excludes entries from previous days', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(activityUsedToday([historyEntry('ai_chat', yesterday)], 'ai_chat')).toBe(0);
  });
});

describe('checkDailyLimit', () => {
  it('always allows premium users regardless of usage', () => {
    const status = checkDailyLimit(999, FREE_DAILY_PRACTICE_QUESTIONS, true);
    expect(status.allowed).toBe(true);
    expect(status.limit).toBe(Infinity);
  });

  it('allows a free user under the limit', () => {
    const status = checkDailyLimit(FREE_DAILY_PRACTICE_QUESTIONS - 1, FREE_DAILY_PRACTICE_QUESTIONS, false);
    expect(status.allowed).toBe(true);
  });

  it('blocks a free user who has reached the limit', () => {
    const status = checkDailyLimit(FREE_DAILY_PRACTICE_QUESTIONS, FREE_DAILY_PRACTICE_QUESTIONS, false);
    expect(status.allowed).toBe(false);
  });

  it('blocks a free user who has exceeded the limit', () => {
    const status = checkDailyLimit(FREE_DAILY_PRACTICE_QUESTIONS + 5, FREE_DAILY_PRACTICE_QUESTIONS, false);
    expect(status.allowed).toBe(false);
  });
});
