import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Badge, Button, Card, IconCircle, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { allVocabularyTopics } from '@/lib/content';
import { FREE_VOCABULARY_TOPIC_LIMIT } from '@/lib/entitlements';
import { getUserVocabularyMap, listVocabulary } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

export default function VocabularyHubScreen() {
  const theme = useTheme();
  const router = useRouter();
  const userId = useAppStore((s) => s.userId);
  const isPremium = useAppStore((s) => s.subscription?.plan !== 'free');

  const userVocabQuery = useQuery({
    queryKey: ['user-vocabulary', userId],
    queryFn: () => getUserVocabularyMap(userId!),
    enabled: Boolean(userId),
  });

  const lockedCount = Math.max(0, allVocabularyTopics.length - FREE_VOCABULARY_TOPIC_LIMIT);

  return (
    <Screen scroll>
      <ScreenHeader title="Vocabulary" showBack />
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
        Topic word packs with flashcards and spaced repetition.
      </Text>
      {allVocabularyTopics.map((topic, i) => {
        const locked = !isPremium && i >= FREE_VOCABULARY_TOPIC_LIMIT;
        const words = listVocabulary(topic);
        const mastered = words.filter((w) => userVocabQuery.data?.[w.id]?.status === 'mastered').length;
        return (
          <Card
            key={topic}
            onPress={() => (locked ? router.push('/paywall') : router.push({ pathname: '/vocabulary-practice', params: { topic } }))}
            style={{ marginBottom: theme.spacing.md, gap: theme.spacing.xs, opacity: locked ? 0.6 : 1 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="h3">{topic}</Text>
              {locked ? <Badge label="Premium" tone="brand" /> : null}
            </View>
            <Text variant="caption" color="secondary">
              {words.length} words • {mastered} mastered
            </Text>
            <ProgressBar progress={words.length ? mastered / words.length : 0} />
          </Card>
        );
      })}
      {!isPremium && lockedCount > 0 ? (
        <Card style={{ alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.lg, marginBottom: theme.spacing.huge }}>
          <IconCircle name="lock-closed" size={48} backgroundColor={theme.colors.warningSoft} color={theme.colors.warning} />
          <Text variant="bodyMedium" align="center">
            {lockedCount} more topic{lockedCount === 1 ? '' : 's'} with Premium
          </Text>
          <Text variant="caption" color="secondary" align="center">
            Free includes {FREE_VOCABULARY_TOPIC_LIMIT} of {allVocabularyTopics.length} vocabulary topics. Upgrade for the full library.
          </Text>
          <Button label="Upgrade to Premium" onPress={() => router.push('/paywall')} fullWidth />
        </Card>
      ) : null}
    </Screen>
  );
}
