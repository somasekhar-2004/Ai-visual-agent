import { activityUsedToday, checkDailyLimit, FREE_DAILY_PRACTICE_QUESTIONS, practiceQuestionsUsedToday } from '@/lib/entitlements';
import type { QuestionAttempt, TestHistoryEntry } from '@/types/models';

jest.mock('@/lib/timezone', () => ({
  ...jest.requireActual('@/lib/timezone'),
  getDeviceTimeZone: () => 'Asia/Kolkata', // UTC+5:30, fixed for the boundary test below
}));

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

describe('practiceQuestionsUsedToday / activityUsedToday — "today" follows the device LOCAL date, not UTC', () => {
  // Regression coverage for the "23/20 used today" bug and its root cause:
  // isToday() used to compare the UTC calendar date
  // (new Date().toISOString().slice(0, 10)), not the device's local one —
  // the exact bug class lib/timezone.ts (see its own header comment, which
  // names this file as the thing it deliberately did NOT copy) was built
  // to avoid for streak/XP, and that Home's study plan separately needed
  // fixing for too.
  beforeAll(() => jest.useFakeTimers());
  afterAll(() => jest.useRealTimers());

  it('counts an attempt that is "yesterday" in UTC but still "today" in the device\'s real (Asia/Kolkata, UTC+5:30) local time', () => {
    // "Now": 2026-06-16T02:00:00Z = 2026-06-16 07:30 IST — June 16 locally.
    jest.setSystemTime(new Date('2026-06-16T02:00:00Z'));
    // Attempt made at 2026-06-15T23:00:00Z = 2026-06-16 04:30 IST — ALSO
    // June 16 locally, despite being June 15 in UTC. A UTC-based isToday
    // would wrongly exclude this; the fixed, local-based one includes it.
    const attempts = [attempt('2026-06-15T23:00:00Z')];
    expect(practiceQuestionsUsedToday(attempts)).toBe(1);
  });

  it('excludes an attempt that is "today" in UTC but was genuinely yesterday in local time', () => {
    // "Now": 2026-06-16T02:00:00Z = 2026-06-16 07:30 IST.
    jest.setSystemTime(new Date('2026-06-16T02:00:00Z'));
    // Attempt made at 2026-06-16T01:00:00Z = 2026-06-16 06:30 IST — still
    // June 16 locally, so this one SHOULD count (sanity check the inverse
    // direction isn't just always-true).
    const sameLocalDay = [attempt('2026-06-16T01:00:00Z')];
    expect(practiceQuestionsUsedToday(sameLocalDay)).toBe(1);
    // An attempt genuinely on the previous LOCAL day (2026-06-15 20:00 IST
    // = 2026-06-15T14:30:00Z) must still be excluded.
    const previousLocalDay = [attempt('2026-06-15T14:30:00Z')];
    expect(practiceQuestionsUsedToday(previousLocalDay)).toBe(0);
  });

  it('activityUsedToday follows the same local-date rule', () => {
    jest.setSystemTime(new Date('2026-06-16T02:00:00Z'));
    const history = [historyEntry('ai_chat', '2026-06-15T23:00:00Z')];
    expect(activityUsedToday(history, 'ai_chat')).toBe(1);
  });
});

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
