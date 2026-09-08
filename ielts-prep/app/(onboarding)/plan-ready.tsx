import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Button, Card, IconCircle, Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

const SKILL_LABEL: Record<string, string> = {
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
  speaking: 'Speaking',
};

export default function PlanReadyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const goal = useAppStore((s) => s.goal);

  const days = daysUntil(goal?.examDate ?? null);

  const stats = [
    { icon: 'flag-outline' as const, label: 'Target band', value: goal?.targetBand?.toFixed(1) ?? '-' },
    { icon: 'trending-up-outline' as const, label: 'Estimated current band', value: goal?.currentBand?.toFixed(1) ?? 'Unknown' },
    { icon: 'calendar-outline' as const, label: 'Days until exam', value: days !== null ? `${days}` : 'Not set' },
    { icon: 'time-outline' as const, label: 'Daily study time', value: `${goal?.dailyStudyMinutes ?? 30} min` },
    {
      icon: 'star-outline' as const,
      label: 'Priority skill',
      value: goal?.weakestSkill ? SKILL_LABEL[goal.weakestSkill] : 'Balanced',
    },
  ];

  return (
    <Screen scroll>
      <View style={{ alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
        <IconCircle name="checkmark-circle" size={80} color={theme.colors.success} backgroundColor={theme.colors.successSoft} />
        <Text variant="display" align="center">
          Your IELTS plan is ready
        </Text>
        <Text variant="body" color="secondary" align="center">
          Here’s what we’ve set up based on your answers. You can adjust any of this later in Settings.
        </Text>
      </View>

      <Card style={{ gap: theme.spacing.md }}>
        {stats.map((stat, i) => (
          <View
            key={stat.label}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.sm,
              paddingBottom: i < stats.length - 1 ? theme.spacing.sm : 0,
              borderBottomWidth: i < stats.length - 1 ? 1 : 0,
              borderBottomColor: theme.colors.border,
            }}
          >
            <Ionicons name={stat.icon} size={20} color={theme.colors.primary} />
            <Text variant="body" color="secondary" style={{ flex: 1 }}>
              {stat.label}
            </Text>
            <Text variant="bodyMedium">{stat.value}</Text>
          </View>
        ))}
      </Card>

      <View style={{ marginTop: theme.spacing.xl }}>
        <Button label="Go to my dashboard" onPress={() => router.replace('/(tabs)')} fullWidth />
      </View>
    </Screen>
  );
}
