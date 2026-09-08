import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Button, Card, IconCircle, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { FREE_GRAMMAR_LESSON_LIMIT } from '@/lib/entitlements';
import { listGrammarLessons } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

export default function GrammarLessonScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isPremium = useAppStore((s) => s.subscription?.plan !== 'free');
  const lessons = listGrammarLessons();
  const lessonIndex = lessons.findIndex((l) => l.id === id);
  const lesson = lessonIndex >= 0 ? lessons[lessonIndex] : undefined;

  if (!lesson) {
    return (
      <Screen>
        <ScreenHeader title="Grammar" showBack />
        <Text color="secondary">This lesson could not be found.</Text>
      </Screen>
    );
  }

  if (!isPremium && lessonIndex >= FREE_GRAMMAR_LESSON_LIMIT) {
    return (
      <Screen>
        <ScreenHeader title={lesson.title} showBack />
        <View style={{ alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.xl, padding: theme.spacing.lg }}>
          <IconCircle name="lock-closed" size={56} backgroundColor={theme.colors.warningSoft} color={theme.colors.warning} />
          <Text variant="h3" align="center">
            This is a Premium lesson
          </Text>
          <Text variant="body" color="secondary" align="center">
            Free includes the first {FREE_GRAMMAR_LESSON_LIMIT} grammar lessons. Upgrade to unlock all {lessons.length}.
          </Text>
          <Button label="Upgrade to Premium" onPress={() => router.push('/paywall')} style={{ marginTop: theme.spacing.sm }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader title={lesson.title} subtitle={lesson.category} showBack />
      <Button
        label="Practice questions on this topic"
        onPress={() => router.push({ pathname: '/grammar-practice', params: { topic: lesson.category } })}
        style={{ marginBottom: theme.spacing.md }}
        fullWidth
      />
      {lesson.content.map((section, i) => (
        <Card key={i} style={{ marginBottom: theme.spacing.md }}>
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
    </Screen>
  );
}
