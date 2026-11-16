import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import type { RecentActivityKey } from '@/lib/recentActivity';
import { markSessionOpened, sessionOpensQueryKey } from '@/services/sessionOpens';
import { useAppStore } from '@/store/useAppStore';

/** Records that the user started or resumed a session of `key`, every time
 * the session screen comes into focus (first open, and coming back to it).
 * Updates Home's Recent activity immediately via the shared query, which
 * Home observes, so it is already current when the user returns.
 *
 * Only writes the on-device session-opens timestamp — never a
 * test_history row, question attempt, score or streak. Fire-and-forget: a
 * storage failure must never interrupt the session itself. */
export function useRecordSessionOpen(key: RecentActivityKey | null) {
  const userId = useAppStore((s) => s.userId);
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      if (!userId || !key) return;
      markSessionOpened(userId, key)
        .then((opens) => queryClient.setQueryData(sessionOpensQueryKey(userId), opens))
        .catch(() => {});
    }, [userId, key, queryClient])
  );
}
