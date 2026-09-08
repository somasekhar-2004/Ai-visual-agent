import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';

import { Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { getUserVocabularyMap, listVocabulary } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import { vocabularyTopics } from '@/lib/content';

export default function VocabularyHubScreen() {
  const theme = useTheme();
  const router = useRouter();
  const userId = useAppStore((s) => s.userId);

  const userVocabQuery = useQuery({
    queryKey: ['user-vocabulary', userId],
    queryFn: () => getUserVocabularyMap(userId!),
    enabled: Boolean(userId),
  });

  return (
    <Screen scroll>
      <ScreenHeader title="Vocabulary" showBack />
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
        Topic word packs with flashcards and spaced repetition.
      </Text>
      {vocabularyTopics.map((topic) => {
        const words = listVocabulary(topic);
        const mastered = words.filter((w) => userVocabQuery.data?.[w.id]?.status === 'mastered').length;
        return (
          <Card
            key={topic}
            onPress={() => router.push({ pathname: '/vocabulary-practice', params: { topic } })}
            style={{ marginBottom: theme.spacing.md, gap: theme.spacing.xs }}
          >
            <Text variant="h3">{topic}</Text>
            <Text variant="caption" color="secondary">
              {words.length} words • {mastered} mastered
            </Text>
            <ProgressBar progress={words.length ? mastered / words.length : 0} />
          </Card>
        );
      })}
    </Screen>
  );
}
