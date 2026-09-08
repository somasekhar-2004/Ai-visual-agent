import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Button } from './Button';
import { Card } from './Card';
import { IconCircle } from './IconCircle';
import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';

/** Shown in place of a feature (Practice, AI Coach, Writing eval, Speaking
 * eval) once a free-tier user has used up today's allowance for it — a
 * single consistent "blocked" state instead of a silently-unlimited
 * feature or a confusing disabled button. */
export function DailyLimitCard({ used, limit, feature }: { used: number; limit: number; feature: string }) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Card style={{ alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.lg }}>
      <IconCircle name="lock-closed" size={56} backgroundColor={theme.colors.warningSoft} color={theme.colors.warning} />
      <Text variant="h3" align="center">
        Daily {feature} limit reached
      </Text>
      <Text variant="body" color="secondary" align="center">
        Free plan includes {limit} {feature.toLowerCase()} per day ({used}/{limit} used today). Upgrade to Premium for unlimited access.
      </Text>
      <View style={{ flexDirection: 'row', gap: theme.spacing.xs, marginTop: theme.spacing.xs }}>
        <Ionicons name="time-outline" size={14} color={theme.colors.textTertiary} />
        <Text variant="caption" color="tertiary">
          Resets at midnight
        </Text>
      </View>
      <Button label="Upgrade to Premium" onPress={() => router.push('/paywall')} style={{ marginTop: theme.spacing.sm }} fullWidth />
    </Card>
  );
}
