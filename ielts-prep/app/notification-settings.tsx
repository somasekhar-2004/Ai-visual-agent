import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Switch, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Card, Divider, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { getNotificationPrefs, setNotificationPref } from '@/services/repository';
import { applyNotificationPreferences } from '@/services/notifications';
import { useAppStore } from '@/store/useAppStore';
import type { NotificationCategory } from '@/types/models';

const ROWS: { key: NotificationCategory; title: string; description: string }[] = [
  { key: 'daily_reminder', title: 'Daily study reminder', description: 'A nudge at a consistent time each day' },
  { key: 'streak_reminder', title: 'Streak reminder', description: "Alerts you before you're about to lose your streak" },
  { key: 'test_countdown', title: 'Test countdown', description: 'A reminder one week before your exam date' },
  { key: 'unfinished_plan', title: 'Unfinished plan', description: "Reminds you if today's study plan is incomplete" },
  { key: 'weekly_summary', title: 'Weekly progress summary', description: 'A recap of your band movement each week' },
];

export default function NotificationSettingsScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { userId, goal } = useAppStore(useShallow((s) => ({ userId: s.userId, goal: s.goal })));

  const prefsQuery = useQuery({
    queryKey: ['notification-prefs', userId],
    queryFn: () => getNotificationPrefs(userId!),
    enabled: Boolean(userId),
  });

  async function toggle(key: NotificationCategory, value: boolean) {
    if (!userId) return;
    await setNotificationPref(userId, key, value);
    queryClient.invalidateQueries({ queryKey: ['notification-prefs', userId] });
    const updated = { ...(prefsQuery.data ?? {}), [key]: value } as Record<NotificationCategory, boolean>;
    await applyNotificationPreferences(updated, goal?.examDate ?? null);
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Notifications" showBack />
      <Card>
        {ROWS.map((row, i) => (
          <View key={row.key}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm, gap: theme.spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{row.title}</Text>
                <Text variant="caption" color="secondary">
                  {row.description}
                </Text>
              </View>
              <Switch
                value={prefsQuery.data?.[row.key] ?? true}
                onValueChange={(v) => toggle(row.key, v)}
                trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
              />
            </View>
            {i < ROWS.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </Card>
    </Screen>
  );
}
