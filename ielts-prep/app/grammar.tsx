import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { listGrammarLessons } from '@/services/repository';

export default function GrammarHubScreen() {
  const theme = useTheme();
  const router = useRouter();
  const lessons = listGrammarLessons();

  return (
    <Screen scroll>
      <ScreenHeader title="Grammar" showBack />
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
        Targeted lessons on the grammar patterns that matter most for IELTS.
      </Text>
      {lessons.map((lesson) => (
        <Card
          key={lesson.id}
          onPress={() => router.push({ pathname: '/grammar-lesson/[id]', params: { id: lesson.id } })}
          style={{ marginBottom: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
        >
          <Ionicons name="school-outline" size={22} color={theme.colors.primary} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">{lesson.title}</Text>
            <Text variant="caption" color="secondary">
              {lesson.category}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
        </Card>
      ))}
    </Screen>
  );
}
