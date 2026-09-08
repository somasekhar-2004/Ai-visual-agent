import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Badge, Button, Card, IconCircle, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { FREE_GRAMMAR_LESSON_LIMIT } from '@/lib/entitlements';
import { listGrammarLessons } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

export default function GrammarHubScreen() {
  const theme = useTheme();
  const router = useRouter();
  const isPremium = useAppStore((s) => s.subscription?.plan !== 'free');
  const lessons = listGrammarLessons();
  const lockedCount = Math.max(0, lessons.length - FREE_GRAMMAR_LESSON_LIMIT);

  return (
    <Screen scroll>
      <ScreenHeader title="Grammar" showBack />
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
        Targeted lessons on the grammar patterns that matter most for IELTS.
      </Text>
      {lessons.map((lesson, i) => {
        const locked = !isPremium && i >= FREE_GRAMMAR_LESSON_LIMIT;
        return (
          <Card
            key={lesson.id}
            onPress={() => (locked ? router.push('/paywall') : router.push({ pathname: '/grammar-lesson/[id]', params: { id: lesson.id } }))}
            style={{ marginBottom: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, opacity: locked ? 0.6 : 1 }}
          >
            <Ionicons name={locked ? 'lock-closed' : 'school-outline'} size={22} color={locked ? theme.colors.textTertiary : theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">{lesson.title}</Text>
              <Text variant="caption" color="secondary">
                {lesson.category}
              </Text>
            </View>
            {locked ? <Badge label="Premium" tone="brand" /> : <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />}
          </Card>
        );
      })}
      {!isPremium && lockedCount > 0 ? (
        <Card style={{ alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.lg, marginBottom: theme.spacing.huge }}>
          <IconCircle name="lock-closed" size={48} backgroundColor={theme.colors.warningSoft} color={theme.colors.warning} />
          <Text variant="bodyMedium" align="center">
            {lockedCount} more lesson{lockedCount === 1 ? '' : 's'} with Premium
          </Text>
          <Text variant="caption" color="secondary" align="center">
            Free includes {FREE_GRAMMAR_LESSON_LIMIT} of {lessons.length} grammar lessons. Upgrade for the full library.
          </Text>
          <Button label="Upgrade to Premium" onPress={() => router.push('/paywall')} fullWidth />
        </Card>
      ) : null}
    </Screen>
  );
}
