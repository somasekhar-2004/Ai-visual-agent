// Regression coverage for Home's "Recent activity" card. Real bugs this
// guards: (1) no 7-day window at all — a month-old entry could still show
// up if the user hadn't done 3 things more recently; (2) an AI Coach
// conversation logs one test_history row per message sent (deliberate —
// lib/entitlements.ts's free daily message limit counts these rows), which
// showed up as that many duplicate-looking "AI Chat" rows with no way to
// tell them apart (no date/time shown at all).
import { formatRelativeTime, recentActivityForHome } from '@/lib/recentActivity';
import type { TestHistoryEntry } from '@/types/models';

function entry(overrides: Partial<TestHistoryEntry>): TestHistoryEntry {
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

const NOW = new Date('2026-11-07T12:00:00Z');
function hoursAgo(h: number): string {
  return new Date(NOW.getTime() - h * 3_600_000).toISOString();
}
function daysAgo(d: number): string {
  return new Date(NOW.getTime() - d * 86_400_000).toISOString();
}

describe('recentActivityForHome', () => {
  it('excludes anything older than 7 days, even if there are fewer than 3 recent entries', () => {
    const history = [
      entry({ id: 'old', activityType: 'writing', createdAt: daysAgo(30) }),
      entry({ id: 'recent', activityType: 'reading', createdAt: hoursAgo(2) }),
    ];
    const result = recentActivityForHome(history, { now: NOW });
    expect(result.map((e) => e.id)).toEqual(['recent']);
  });

  it('includes an entry right at the 7-day boundary and excludes one just past it', () => {
    const history = [
      entry({ id: 'at-boundary', createdAt: daysAgo(7) }),
      entry({ id: 'past-boundary', createdAt: new Date(NOW.getTime() - 7 * 86_400_000 - 1000).toISOString() }),
    ];
    const result = recentActivityForHome(history, { now: NOW });
    expect(result.map((e) => e.id)).toEqual(['at-boundary']);
  });

  it('collapses several ai_chat rows for the SAME conversation into one row, keeping only the latest', () => {
    const history = [
      entry({ id: 'm1', activityType: 'ai_chat', refId: 'conv-1', createdAt: hoursAgo(3) }),
      entry({ id: 'm2', activityType: 'ai_chat', refId: 'conv-1', createdAt: hoursAgo(2) }),
      entry({ id: 'm3', activityType: 'ai_chat', refId: 'conv-1', createdAt: hoursAgo(1) }),
    ];
    const result = recentActivityForHome(history, { now: NOW });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('m3'); // the most recent message in the conversation
  });

  it('keeps ai_chat rows for DIFFERENT conversations separate', () => {
    const history = [
      entry({ id: 'conv-a-msg', activityType: 'ai_chat', refId: 'conv-a', createdAt: hoursAgo(2) }),
      entry({ id: 'conv-b-msg', activityType: 'ai_chat', refId: 'conv-b', createdAt: hoursAgo(1) }),
    ];
    const result = recentActivityForHome(history, { now: NOW });
    expect(result.map((e) => e.id).sort()).toEqual(['conv-a-msg', 'conv-b-msg']);
  });

  it('never merges two different activity types that happen to share a refId', () => {
    const history = [
      entry({ id: 'r1', activityType: 'reading', refId: 'shared-id', createdAt: hoursAgo(2) }),
      entry({ id: 'w1', activityType: 'writing', refId: 'shared-id', createdAt: hoursAgo(1) }),
    ];
    const result = recentActivityForHome(history, { now: NOW });
    expect(result).toHaveLength(2);
  });

  it('sorts newest first and respects the limit', () => {
    const history = [
      entry({ id: 'a', createdAt: hoursAgo(5) }),
      entry({ id: 'b', createdAt: hoursAgo(1) }),
      entry({ id: 'c', createdAt: hoursAgo(3) }),
      entry({ id: 'd', createdAt: hoursAgo(4) }),
    ];
    const result = recentActivityForHome(history, { now: NOW, limit: 3 });
    expect(result.map((e) => e.id)).toEqual(['b', 'c', 'd']);
  });

  it('returns an empty list, never a fabricated entry, when nothing is within the window', () => {
    const history = [entry({ createdAt: daysAgo(30) })];
    expect(recentActivityForHome(history, { now: NOW })).toEqual([]);
  });
});

describe('formatRelativeTime', () => {
  it('shows "Just now" for something under a minute old', () => {
    expect(formatRelativeTime(new Date(NOW.getTime() - 10_000).toISOString(), NOW)).toBe('Just now');
  });

  it('shows minutes for under an hour', () => {
    expect(formatRelativeTime(new Date(NOW.getTime() - 42 * 60_000).toISOString(), NOW)).toBe('42m ago');
  });

  it('shows hours for under a day', () => {
    expect(formatRelativeTime(hoursAgo(5), NOW)).toBe('5h ago');
  });

  it('shows "Yesterday" for exactly one day ago', () => {
    expect(formatRelativeTime(daysAgo(1), NOW)).toBe('Yesterday');
  });

  it('shows a day count beyond yesterday', () => {
    expect(formatRelativeTime(daysAgo(5), NOW)).toBe('5d ago');
  });
});
