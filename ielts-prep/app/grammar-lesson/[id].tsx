import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { listGrammarLessons } from '@/services/repository';

export default function GrammarLessonScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = listGrammarLessons().find((l) => l.id === id);

  if (!lesson) {
    return (
      <Screen>
        <ScreenHeader title="Grammar" showBack />
        <Text color="secondary">This lesson could not be found.</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader title={lesson.title} subtitle={lesson.category} showBack />
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
