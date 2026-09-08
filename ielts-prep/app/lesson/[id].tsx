import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
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
    await markLessonComplete(userId, lesson!.id);
    await recordDailyActivity(userId, 15);
    queryClient.invalidateQueries({ queryKey: ['lesson-progress', userId] });
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
        variant={completed ? 'secondary' : 'primary'}
        fullWidth
        style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing.huge }}
      />
    </Screen>
  );
}
