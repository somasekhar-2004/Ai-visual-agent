import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Badge, Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { getLessonById } from '@/services/repository/learning';
import { getLessonProgressMap, markLessonComplete, recordDailyActivity } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

export default function LessonDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAppStore((s) => s.userId);
  const queryClient = useQueryClient();
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const lesson = getLessonById(id);

  const progressQuery = useQuery({
    queryKey: ['lesson-progress', userId],
    queryFn: () => getLessonProgressMap(userId!),
    enabled: Boolean(userId),
  });

  if (!lesson) {
    return (
      <Screen>
        <ScreenHeader title="Lesson" showBack />
        <Text color="secondary">This lesson could not be found.</Text>
      </Screen>
    );
  }

  const completed = Boolean(progressQuery.data?.[lesson.id]);

  async function handleComplete() {
    if (!userId) return;
    setCompleting(true);
    setCompleteError(null);
    try {
      await markLessonComplete(userId, lesson!.id);
      await recordDailyActivity(userId, 15);
      // Wait for the refetch so `completed` (and the button label) only
      // flips once the database really has the new row — a failed upsert
      // now throws instead of silently no-op'ing, but without awaiting this
      // the button could still flash "Completed" for a stale cache tick.
      await queryClient.invalidateQueries({ queryKey: ['lesson-progress', userId] });
    } catch (err) {
      setCompleteError((err as Error).message);
    } finally {
      setCompleting(false);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader title={lesson.title} subtitle={lesson.category} showBack />
      <Badge label={`${lesson.estimatedMinutes} min read`} tone="neutral" />

      {lesson.content.map((section, i) => (
        <Card key={i} style={{ marginTop: theme.spacing.lg }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            {section.heading}
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.sm, lineHeight: 22 }}>
            {section.body}
          </Text>
          {section.tips.map((tip, j) => (
            <View key={j} style={{ flexDirection: 'row', gap: theme.spacing.xs, marginTop: theme.spacing.xs }}>
              <Ionicons name="bulb-outline" size={16} color={theme.colors.warning} style={{ marginTop: 2 }} />
              <Text variant="body" style={{ flex: 1 }}>
                {tip}
              </Text>
            </View>
          ))}
        </Card>
      ))}

      <Button
        label={completed ? 'Completed' : 'Mark as complete'}
        onPress={handleComplete}
        disabled={completed}
        loading={completing}
        variant={completed ? 'secondary' : 'primary'}
        fullWidth
        style={{ marginTop: theme.spacing.xl }}
      />
      {completeError ? (
        <Text color="error" style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.huge }}>
          {completeError}
        </Text>
      ) : (
        <View style={{ marginBottom: theme.spacing.huge }} />
      )}
    </Screen>
  );
}
