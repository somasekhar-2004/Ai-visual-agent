import type { TestHistoryEntry } from '@/types/models';

/**
 * Home's "Recent activity" card — pure logic, separated from
 * app/(tabs)/index.tsx so it's directly testable. Two real bugs this fixes:
 *
 * 1. getTestHistory() returns EVERY row ever recorded, newest-first, with no
 *    time window at all — Home just took the first 3 rows, which could
 *    (and did) include something from a month ago if the user hadn't done
 *    3 things more recently. Now filtered to the last `windowDays`.
 * 2. An AI Coach conversation logs one test_history row per MESSAGE sent
 *    (addTestHistory(userId, 'ai_chat', conversationId, ...) — see
 *    app/ai-coach.tsx's send()) — this is deliberate and must stay exactly
 *    as-is, since lib/entitlements.ts's free-tier daily message limit
 *    counts these rows. Without grouping, a single conversation with
 *    several back-and-forth messages showed up as that many identical
 *    "AI Chat" rows, crowding out everything else. This groups by
 *    (activityType, refId) and keeps only the most recent occurrence, so a
 *    continued conversation shows as ONE row whose time keeps updating,
 *    not one row per message — while the underlying rows (and the quota
 *    count they back) are untouched.
 */
export function recentActivityForHome(
  history: TestHistoryEntry[],
  options: { windowDays?: number; limit?: number; now?: Date } = {}
): TestHistoryEntry[] {
  const { windowDays = 7, limit = 3, now = new Date() } = options;
  const cutoffMs = now.getTime() - windowDays * 86_400_000;
  const withinWindow = history.filter((h) => new Date(h.createdAt).getTime() >= cutoffMs);

  // refId is the natural "same real thing" key (a conversation, a
  // submission, a session) — grouping by (activityType, refId) is a no-op
  // for every OTHER activity type, which already logs exactly one row per
  // real attempt; it only changes ai_chat's display. A null/missing refId
  // (not expected for any current activity type, but not guaranteed never
  // to happen) falls back to the row's own id so it's never merged with an
  // unrelated row just for sharing a null ref.
  const latestByKey = new Map<string, TestHistoryEntry>();
  for (const entry of withinWindow) {
    const key = `${entry.activityType}:${entry.refId ?? entry.id}`;
    const existing = latestByKey.get(key);
    if (!existing || new Date(entry.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
      latestByKey.set(key, entry);
    }
  }

  return Array.from(latestByKey.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

/** A short, human relative-time label for a recent-activity row — e.g.
 * "Just now", "42m ago", "3h ago", "Yesterday", "5d ago". Only ever called
 * on rows already filtered to the last 7 days (see recentActivityForHome),
 * so the longest label this needs to produce is "7d ago" — no month/year
 * handling needed. */
export function formatRelativeTime(createdAt: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(createdAt).getTime();
  const diffMinutes = Math.round(diffMs / 60_000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}
