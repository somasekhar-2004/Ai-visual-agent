import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Badge, Card, IconCircle, ProgressBar, Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { listLessons } from '@/services/repository/learning';
import { getLessonProgressMap } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import type { SkillKey } from '@/types/models';

const SKILLS: { key: SkillKey; title: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'reading', title: 'Reading', description: 'Strategies, question types, and pacing', icon: 'book-outline' },
  { key: 'listening', title: 'Listening', description: 'Prediction, accents, and note-taking', icon: 'headset-outline' },
  { key: 'writing', title: 'Writing', description: 'Task 1, Task 2, structure, and grammar', icon: 'create-outline' },
  { key: 'speaking', title: 'Speaking', description: 'Fluency, cue cards, and follow-ups', icon: 'mic-outline' },
];

export default function LearnHubScreen() {
  const theme = useTheme();
  const router = useRouter();
  const userId = useAppStore((s) => s.userId);

  const progressQuery = useQuery({
    queryKey: ['lesson-progress', userId],
    queryFn: () => getLessonProgressMap(userId!),
    enabled: Boolean(userId),
  });

  return (
    <Screen scroll>
      <Text variant="h1" style={{ marginBottom: theme.spacing.xs }}>
        Learn
      </Text>
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
        Structured lessons for every part of the test.
      </Text>

      {SKILLS.map((skill) => {
        const lessons = listLessons(skill.key);
        const completedCount = lessons.filter((l) => progressQuery.data?.[l.id]).length;
        const color = theme.skillColors[skill.key];

        return (
          <Card
            key={skill.key}
            onPress={() => router.push({ pathname: '/learn/[skill]', params: { skill: skill.key } })}
            style={{ marginBottom: theme.spacing.md, gap: theme.spacing.xs }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <IconCircle name={skill.icon} color={color} backgroundColor={color + '22'} />
              <View style={{ flex: 1 }}>
                <Text variant="h3">{skill.title}</Text>
                <Text variant="caption" color="secondary">
                  {skill.description}
                </Text>
              </View>
              <Badge label={`${completedCount}/${lessons.length}`} tone="neutral" />
            </View>
            <ProgressBar progress={lessons.length ? completedCount / lessons.length : 0} color={color} />
          </Card>
        );
      })}

      <Card onPress={() => router.push('/grammar')} style={{ marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <IconCircle name="school-outline" />
        <View style={{ flex: 1 }}>
          <Text variant="h3">Grammar</Text>
          <Text variant="caption" color="secondary">
            Targeted lessons on IELTS-relevant grammar
          </Text>
        </View>
      </Card>

      <Card onPress={() => router.push('/vocabulary')} style={{ marginBottom: theme.spacing.huge, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <IconCircle name="albums-outline" />
        <View style={{ flex: 1 }}>
          <Text variant="h3">Vocabulary</Text>
          <Text variant="caption" color="secondary">
            Topic word packs with flashcards and spaced repetition
          </Text>
        </View>
      </Card>
    </Screen>
  );
}
