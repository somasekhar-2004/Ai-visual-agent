import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Badge, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { getLessonProgressMap, listLessons } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import type { SkillKey } from '@/types/models';

export default function SkillLessonsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { skill } = useLocalSearchParams<{ skill: SkillKey }>();
  const userId = useAppStore((s) => s.userId);
  const isPremium = useAppStore((s) => s.subscription?.plan !== 'free');

  const progressQuery = useQuery({
    queryKey: ['lesson-progress', userId],
    queryFn: () => getLessonProgressMap(userId!),
    enabled: Boolean(userId),
  });

  const lessons = useMemo(() => listLessons(skill), [skill]);
  const categories = useMemo(() => Array.from(new Set(lessons.map((l) => l.category))), [lessons]);

  return (
    <Screen scroll>
      <ScreenHeader title={`${skill?.charAt(0).toUpperCase()}${skill?.slice(1)} lessons`} showBack />
      {categories.map((category) => (
        <View key={category} style={{ marginBottom: theme.spacing.lg }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            {category}
          </Text>
          {lessons
            .filter((l) => l.category === category)
            .map((lesson) => {
              const completed = Boolean(progressQuery.data?.[lesson.id]);
              const locked = lesson.isPremium && !isPremium;
              return (
                <Card
                  key={lesson.id}
                  onPress={() => (locked ? router.push('/paywall') : router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } }))}
                  style={{ marginBottom: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
                >
                  <Ionicons
                    name={completed ? 'checkmark-circle' : locked ? 'lock-closed-outline' : 'play-circle-outline'}
                    size={24}
                    color={completed ? theme.colors.success : theme.colors.primary}
                  />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium">{lesson.title}</Text>
                    <Text variant="caption" color="secondary">
                      {lesson.subtitle} • {lesson.estimatedMinutes} min
                    </Text>
                  </View>
                  {locked ? <Badge label="Premium" tone="brand" /> : null}
                </Card>
              );
            })}
        </View>
      ))}
    </Screen>
  );
}
