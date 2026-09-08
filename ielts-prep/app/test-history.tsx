import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { View } from 'react-native';

import { Badge, Card, EmptyState, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { getTestHistory } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

const ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  mock_test: 'albums-outline',
  reading: 'book-outline',
  listening: 'headset-outline',
  writing: 'create-outline',
  speaking: 'mic-outline',
  practice: 'create-outline',
};

export default function TestHistoryScreen() {
  const theme = useTheme();
  const userId = useAppStore((s) => s.userId);
  const historyQuery = useQuery({ queryKey: ['test-history', userId], queryFn: () => getTestHistory(userId!), enabled: Boolean(userId) });

  return (
    <Screen scroll>
      <ScreenHeader title="Test history" showBack />
      {!historyQuery.data?.length ? (
        <EmptyState icon="time-outline" title="No test history yet" description="Complete a practice session or mock test to see it here." />
      ) : (
        historyQuery.data.map((entry) => (
          <Card key={entry.id} style={{ marginBottom: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <Ionicons name={ICON[entry.activityType] ?? 'document-outline'} size={22} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium" style={{ textTransform: 'capitalize' }}>
                {entry.activityType.replace('_', ' ')}
              </Text>
              <Text variant="caption" color="tertiary">
                {new Date(entry.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {entry.band ? <Badge label={`Band ${entry.band.toFixed(1)}`} tone="brand" /> : null}
          </Card>
        ))
      )}
    </Screen>
  );
}
