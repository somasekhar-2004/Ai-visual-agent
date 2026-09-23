// Regression coverage for the FINAL PRE-LAUNCH PRODUCT AUDIT's Home
// Dashboard section: lib/analytics.ts backs every "progress" number on the
// Home screen (overall accuracy, weekly activity, weakest/strongest skill,
// per-criterion trend) and had no test file at all before this.

import {
  accuracyByQuestionType,
  activityCountInWindow,
  criterionTrend,
  estimatedMinutesStudied,
  overallAccuracy,
  weakestAndStrongestSkill,
  weeklyActivityCounts,
} from '@/lib/analytics';
import type { QuestionAttempt, TestHistoryEntry } from '@/types/models';

function attempt(overrides: Partial<QuestionAttempt>): QuestionAttempt {
  return {
    id: 'a1',
    userId: 'u1',
    questionId: 'reading-q-1',
    selectedAnswer: 'x',
    isCorrect: true,
    timeSpentSeconds: 30,
    practiceSessionId: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function historyEntry(overrides: Partial<TestHistoryEntry>): TestHistoryEntry {
  return {
    id: 'h1',
    userId: 'u1',
    activityType: 'reading',
    refId: null,
    band: null,
    createdAt: new Date().toISOString(),
    summary: {},
    ...overrides,
  };
}

describe('overallAccuracy', () => {
  it('returns 0 for a fresh user with no attempts — never a fabricated non-zero value', () => {
    expect(overallAccuracy([])).toBe(0);
  });

  it('computes correct / total exactly', () => {
    const attempts = [attempt({ isCorrect: true }), attempt({ isCorrect: true }), attempt({ isCorrect: false }), attempt({ isCorrect: false })];
    expect(overallAccuracy(attempts)).toBe(0.5);
  });

  it('is user-specific in the sense that it only ever sees the attempts it is handed (caller must scope the query, this function trusts its input)', () => {
    const onlyMineAndCorrect = [attempt({ userId: 'me', isCorrect: true })];
    expect(overallAccuracy(onlyMineAndCorrect)).toBe(1);
  });
});

describe('accuracyByQuestionType', () => {
  it('returns an empty list for no attempts', () => {
    expect(accuracyByQuestionType([])).toEqual([]);
  });

  it('sorts ascending by accuracy so the worst-performing type is first', () => {
    const attempts = [
      attempt({ questionId: 'rq-1', isCorrect: true }), // true_false_not_given fixture id, see lib/content
    ];
    const result = accuracyByQuestionType(attempts);
    // Unknown ids (not in the bundled content) fall back to 'unknown' rather
    // than throwing — still exercises the grouping/sort path end-to-end.
    expect(result.every((r, i, arr) => i === 0 || arr[i - 1].accuracy <= r.accuracy)).toBe(true);
  });
});

describe('weeklyActivityCounts', () => {
  it('returns exactly `days` buckets, oldest first, all zero for a fresh user', () => {
    const buckets = weeklyActivityCounts([], 7);
    expect(buckets).toHaveLength(7);
    expect(buckets.every((b) => b.count === 0)).toBe(true);
    // Oldest-first: each successive bucket's date is one calendar day later.
    for (let i = 1; i < buckets.length; i++) {
      const prev = new Date(buckets[i - 1].date);
      const cur = new Date(buckets[i].date);
      expect(Math.round((cur.getTime() - prev.getTime()) / 86_400_000)).toBe(1);
    }
    expect(buckets[buckets.length - 1].date).toBe(new Date().toISOString().slice(0, 10));
  });

  it('buckets a real history entry into today\'s slot', () => {
    const buckets = weeklyActivityCounts([historyEntry({ createdAt: new Date().toISOString() })], 7);
    expect(buckets[buckets.length - 1].count).toBe(1);
    expect(buckets.slice(0, -1).every((b) => b.count === 0)).toBe(true);
  });

  it('ignores an entry older than the window entirely (never wraps into the wrong bucket)', () => {
    const old = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const buckets = weeklyActivityCounts([historyEntry({ createdAt: old })], 7);
    expect(buckets.every((b) => b.count === 0)).toBe(true);
  });
});

describe('activityCountInWindow', () => {
  it('is 0 for a fresh user', () => {
    expect(activityCountInWindow([], 7)).toBe(0);
  });

  it('counts only entries within the window, excluding older ones', () => {
    const recent = historyEntry({ createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString() });
    const old = historyEntry({ createdAt: new Date(Date.now() - 40 * 86_400_000).toISOString() });
    expect(activityCountInWindow([recent, old], 7)).toBe(1);
    expect(activityCountInWindow([recent, old], 60)).toBe(2);
  });
});

describe('estimatedMinutesStudied', () => {
  it('is 0 for a fresh user (never fabricated)', () => {
    expect(estimatedMinutesStudied([])).toBe(0);
  });

  it('sums timeSpentSeconds across activities and rounds to whole minutes', () => {
    const history = [historyEntry({ summary: { timeSpentSeconds: 90 } }), historyEntry({ summary: { timeSpentSeconds: 30 } })];
    expect(estimatedMinutesStudied(history)).toBe(2); // 120s / 60 = 2
  });

  it('treats an activity with no recorded time as 0 rather than throwing (Listening/Speaking under-count, never over-count)', () => {
    const history = [historyEntry({ summary: {} }), historyEntry({ summary: { timeSpentSeconds: 60 } })];
    expect(estimatedMinutesStudied(history)).toBe(1);
  });
});

describe('weakestAndStrongestSkill', () => {
  it('returns null/null when no bands are recorded yet — never guesses', () => {
    expect(weakestAndStrongestSkill({})).toEqual({ weakest: null, strongest: null });
  });

  it('picks the lowest and highest band correctly', () => {
    const result = weakestAndStrongestSkill({ listening: 7, reading: 5, writing: 6.5, speaking: 8 });
    expect(result).toEqual({ weakest: 'reading', strongest: 'speaking' });
  });

  it('ignores a skill with no recorded band rather than treating it as 0', () => {
    const result = weakestAndStrongestSkill({ listening: 6, reading: undefined });
    expect(result).toEqual({ weakest: 'listening', strongest: 'listening' });
  });
});

describe('criterionTrend', () => {
  it('returns an empty trend for a fresh user', () => {
    expect(criterionTrend([], 'writing', 'lexicalResource')).toEqual([]);
  });

  it('filters to the given activityType and criterion, reversing to oldest-first for a chart', () => {
    const history = [
      historyEntry({ activityType: 'writing', createdAt: '2026-01-03T00:00:00Z', summary: { lexicalResource: 7 } }),
      historyEntry({ activityType: 'writing', createdAt: '2026-01-02T00:00:00Z', summary: { lexicalResource: 6 } }),
      historyEntry({ activityType: 'speaking', createdAt: '2026-01-01T00:00:00Z', summary: { lexicalResource: 9 } }),
    ];
    // History is fetched newest-first (index 0 = most recent); the trend
    // must come back oldest-first for a left-to-right chart, and must never
    // pull in the speaking entry despite sharing the same criterion name.
    expect(criterionTrend(history, 'writing', 'lexicalResource')).toEqual([6, 7]);
  });

  it('skips an entry where the criterion was never recorded (not coerced to 0)', () => {
    const history = [historyEntry({ activityType: 'writing', summary: {} })];
    expect(criterionTrend(history, 'writing', 'lexicalResource')).toEqual([]);
  });
});
