import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Card, IconCircle, Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { getBookmarks, getQuestionAttempts, listQuestions } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import type { SkillKey } from '@/types/models';

const SKILLS: { key: SkillKey; title: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'reading', title: 'Reading', icon: 'book-outline' },
  { key: 'listening', title: 'Listening', icon: 'headset-outline' },
];

export default function PracticeHubScreen() {
  const theme = useTheme();
  const router = useRouter();
  const userId = useAppStore((s) => s.userId);

  const attemptsQuery = useQuery({
    queryKey: ['question-attempts', userId],
    queryFn: () => getQuestionAttempts(userId!),
    enabled: Boolean(userId),
  });
  const bookmarksQuery = useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: () => getBookmarks(userId!),
    enabled: Boolean(userId),
  });

  const attempted = new Set(attemptsQuery.data?.map((a) => a.questionId));
  const incorrectIds = new Set(attemptsQuery.data?.filter((a) => !a.isCorrect).map((a) => a.questionId));

  return (
    <Screen scroll>
      <Text variant="h1" style={{ marginBottom: theme.spacing.xs }}>
        Practice
      </Text>
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
        Unlimited question practice with instant feedback.
      </Text>

      {SKILLS.map((skill) => {
        const total = listQuestions({ skill: skill.key }).length;
        const done = listQuestions({ skill: skill.key }).filter((q) => attempted.has(q.id)).length;
        return (
          <Card
            key={skill.key}
            onPress={() => router.push({ pathname: '/practice-session', params: { skill: skill.key } })}
            style={{ marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
          >
            <IconCircle name={skill.icon} color={theme.skillColors[skill.key]} backgroundColor={theme.skillColors[skill.key] + '22'} />
            <View style={{ flex: 1 }}>
              <Text variant="h3">{skill.title} practice</Text>
              <Text variant="caption" color="secondary">
                {done}/{total} questions attempted
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
          </Card>
        );
      })}

      <Card
        onPress={() => router.push({ pathname: '/practice-session', params: { mode: 'incorrect' } })}
        style={{ marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
      >
        <IconCircle name="refresh-outline" backgroundColor={theme.colors.warningSoft} color={theme.colors.warning} />
        <View style={{ flex: 1 }}>
          <Text variant="h3">Retry incorrect</Text>
          <Text variant="caption" color="secondary">
            {incorrectIds.size} question(s) to review
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
      </Card>

      <Card
        onPress={() => router.push({ pathname: '/practice-session', params: { mode: 'bookmarked' } })}
        style={{ marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
      >
        <IconCircle name="bookmark-outline" />
        <View style={{ flex: 1 }}>
          <Text variant="h3">Bookmarked questions</Text>
          <Text variant="caption" color="secondary">
            {bookmarksQuery.data?.filter((b) => b.questionId).length ?? 0} saved
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
      </Card>

      <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>
        Speaking practice
      </Text>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
        {(['part1', 'part2', 'part3'] as const).map((part) => (
          <Card
            key={part}
            onPress={() => router.push({ pathname: '/speaking-session', params: { part } })}
            style={{ flex: 1, alignItems: 'center', gap: 4 }}
          >
            <Ionicons name="mic-outline" size={20} color={theme.skillColors.speaking} />
            <Text variant="caption">{part.replace('part', 'Part ')}</Text>
          </Card>
        ))}
      </View>

      <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>
        Writing practice
      </Text>
      <Card
        onPress={() => router.push('/writing-test')}
        style={{ marginBottom: theme.spacing.huge, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
      >
        <IconCircle name="create-outline" color={theme.skillColors.writing} backgroundColor={theme.skillColors.writing + '22'} />
        <View style={{ flex: 1 }}>
          <Text variant="h3">Timed writing task</Text>
          <Text variant="caption" color="secondary">
            Task 1 or Task 2 with instant AI feedback
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
      </Card>
    </Screen>
  );
}
