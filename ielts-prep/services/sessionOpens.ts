import AsyncStorage from '@react-native-async-storage/async-storage';

import { withSessionOpen, type RecentActivityKey, type SessionOpens } from '@/lib/recentActivity';

/** On-device "last started/resumed" timestamps for Home's Recent activity
 * (see lib/recentActivity.ts). Intentionally local-only and separate from
 * test_history: opening a session is not an attempt, so it must never
 * reach Test history, scores, streaks or quotas — and it needs no backend
 * change. Keyed per user so another account on the same device never sees
 * it. */
export function sessionOpensStorageKey(userId: string): string {
  return `ielts-prep/recent-activity/session-opens/${userId}`;
}

export function sessionOpensQueryKey(userId: string | null | undefined) {
  return ['session-opens', userId] as const;
}

export async function getSessionOpens(userId: string): Promise<SessionOpens> {
  try {
    const raw = await AsyncStorage.getItem(sessionOpensStorageKey(userId));
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const result: SessionOpens = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === 'string' && Number.isFinite(new Date(value).getTime())) {
        result[key as RecentActivityKey] = value;
      }
    }
    return result;
  } catch {
    // Corrupt/unreadable local data must never break Home — just show none.
    return {};
  }
}

export async function markSessionOpened(userId: string, key: RecentActivityKey, now: Date = new Date()): Promise<SessionOpens> {
  const next = withSessionOpen(await getSessionOpens(userId), key, now);
  await AsyncStorage.setItem(sessionOpensStorageKey(userId), JSON.stringify(next));
  return next;
}
