import type { ActivityType, TestHistoryEntry } from '@/types/models';

/** Home's "Recent activity" only ever looks back this far. */
export const RECENT_ACTIVITY_WINDOW_HOURS = 6;

/** Every kind of thing that can appear in Recent activity: the
 * test_history activity types, plus the practice areas that have no
 * test_history rows of their own (vocabulary, grammar). */
export type RecentActivityKey = ActivityType | 'vocabulary' | 'grammar';

/** When the user last started or resumed a session of each kind — at most
 * one timestamp per key, so repeated visits can never multiply into
 * duplicate rows. Stored on-device only (services/sessionOpens.ts), and
 * deliberately NOT a test_history row: opening a session is not answering
 * a question or completing a test, so it must never touch Test history,
 * scores, streaks, the weekly activity chart, or the AI Coach message quota
 * (all of which read test_history). */
export type SessionOpens = Partial<Record<RecentActivityKey, string>>;

export type RecentActivityRow = {
  id: string;
  activityType: RecentActivityKey;
  /** 'completed' = a real test_history row; 'opened' = a session was
   * started/resumed with no newer completed attempt of the same kind. */
  kind: 'completed' | 'opened';
  band: number | null;
  createdAt: string;
};

/** Pure update for a session open: one timestamp per key, latest wins. */
export function withSessionOpen(opens: SessionOpens, key: RecentActivityKey, now: Date = new Date()): SessionOpens {
  return { ...opens, [key]: now.toISOString() };
}

/**
 * Home's "Recent activity" card — pure logic, separated from
 * app/(tabs)/index.tsx so it's directly testable.
 *
 * 1. Only the last RECENT_ACTIVITY_WINDOW_HOURS (6h). getTestHistory()
 *    returns every row ever recorded, so without a window Home showed
 *    items from days ago.
 * 2. An AI Coach conversation logs one test_history row per MESSAGE sent
 *    (addTestHistory(userId, 'ai_chat', conversationId, ...) — see
 *    app/ai-coach.tsx's send()) — this is deliberate and must stay exactly
 *    as-is, since lib/entitlements.ts's free-tier daily message limit
 *    counts these rows. Completed rows are grouped by (activityType, refId)
 *    keeping only the latest, so a continued conversation shows as ONE row
 *    whose time keeps updating, while separate conversations/attempts stay
 *    separate rows.
 * 3. Starting or resuming a session (`opens`) shows up immediately as one
 *    "opened" row per kind — but only when it is newer than that kind's
 *    latest completed row in the window; otherwise the completed row
 *    already represents that session and an extra row would be a duplicate.
 */
export function recentActivityForHome(
  history: TestHistoryEntry[],
  options: { windowHours?: number; limit?: number; now?: Date; opens?: SessionOpens } = {}
): RecentActivityRow[] {
  const { windowHours = RECENT_ACTIVITY_WINDOW_HOURS, limit = 3, now = new Date(), opens = {} } = options;
  const cutoffMs = now.getTime() - windowHours * 3_600_000;
  const inWindow = (iso: string) => {
    const t = new Date(iso).getTime();
    return Number.isFinite(t) && t >= cutoffMs;
  };

  // refId is the natural "same real thing" key (a conversation, a
  // submission, a session) — grouping by (activityType, refId) is a no-op
  // for every OTHER activity type, which already logs exactly one row per
  // real attempt; it only changes ai_chat's display. A null/missing refId
  // falls back to the row's own id so it's never merged with an unrelated
  // row just for sharing a null ref.
  const latestByKey = new Map<string, TestHistoryEntry>();
  for (const entry of history) {
    if (!inWindow(entry.createdAt)) continue;
    const key = `${entry.activityType}:${entry.refId ?? entry.id}`;
    const existing = latestByKey.get(key);
    if (!existing || new Date(entry.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
      latestByKey.set(key, entry);
    }
  }

  const rows: RecentActivityRow[] = Array.from(latestByKey.values()).map((e) => ({
    id: e.id,
    activityType: e.activityType,
    kind: 'completed',
    band: e.band,
    createdAt: e.createdAt,
  }));

  const latestCompletedMs = new Map<RecentActivityKey, number>();
  for (const r of rows) {
    const t = new Date(r.createdAt).getTime();
    if (t > (latestCompletedMs.get(r.activityType) ?? -Infinity)) latestCompletedMs.set(r.activityType, t);
  }

  for (const [key, openedAt] of Object.entries(opens) as [RecentActivityKey, string | undefined][]) {
    if (!openedAt || !inWindow(openedAt)) continue;
    if (new Date(openedAt).getTime() <= (latestCompletedMs.get(key) ?? -Infinity)) continue;
    rows.push({ id: `opened:${key}`, activityType: key, kind: 'opened', band: null, createdAt: openedAt });
  }

  return rows
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

/** A short, human relative-time label for a recent-activity row — e.g.
 * "Just now", "42m ago", "3h ago", "Yesterday", "5d ago". Home only shows
 * rows from the last 6 hours, so in practice the longest label it needs is
 * "6h ago"; the day labels remain for any other caller. */
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
