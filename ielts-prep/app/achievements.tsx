import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Badge, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { getUserAchievements, listAchievements } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

export default function AchievementsScreen() {
  const theme = useTheme();
  const { userId, streak, xp } = useAppStore(useShallow((s) => ({ userId: s.userId, streak: s.streak, xp: s.xp })));
  const achievements = listAchievements();

  const earnedQuery = useQuery({
    queryKey: ['user-achievements', userId],
    queryFn: () => getUserAchievements(userId!),
    enabled: Boolean(userId),
  });
  const earnedIds = new Set(earnedQuery.data?.map((a) => a.achievementId));

  return (
    <Screen scroll>
      <ScreenHeader title="Achievements" showBack />
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
        <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text variant="h2">🔥 {streak.count}</Text>
          <Text variant="caption" color="secondary">
            Day streak
          </Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text variant="h2">{xp} XP</Text>
          <Text variant="caption" color="secondary">
            Total earned
          </Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text variant="h2">
            {earnedIds.size}/{achievements.length}
          </Text>
          <Text variant="caption" color="secondary">
            Unlocked
          </Text>
        </Card>
      </View>

      {achievements.map((a) => {
        const earned = earnedIds.has(a.id);
        return (
          <Card
            key={a.id}
            style={{
              marginBottom: theme.spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.sm,
              opacity: earned ? 1 : 0.55,
            }}
          >
            <Ionicons name={a.icon as any} size={26} color={earned ? theme.colors.warning : theme.colors.textTertiary} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">{a.title}</Text>
              <Text variant="caption" color="secondary">
                {a.description}
              </Text>
            </View>
            {earned ? <Badge label="Unlocked" tone="success" /> : null}
          </Card>
        );
      })}
    </Screen>
  );
}
