import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Badge, Button, Card, Chip, IconCircle, ProgressBar, Screen, ScreenHeader, Text, TextField } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { allVocabularyTopics } from '@/lib/content';
import { FREE_VOCABULARY_TOPIC_LIMIT } from '@/lib/entitlements';
import { getUserVocabularyMap, listVocabulary } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

type StatusFilter = 'all' | 'not_started' | 'in_progress' | 'mastered';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'not_started', label: 'Not started' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'mastered', label: 'Mastered' },
];

export default function VocabularyHubScreen() {
  const theme = useTheme();
  const router = useRouter();
  const userId = useAppStore((s) => s.userId);
  const isPremium = useAppStore((s) => s.subscription?.plan !== 'free');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const userVocabQuery = useQuery({
    queryKey: ['user-vocabulary', userId],
    queryFn: () => getUserVocabularyMap(userId!),
    enabled: Boolean(userId),
  });

  const lockedCount = Math.max(0, allVocabularyTopics.length - FREE_VOCABULARY_TOPIC_LIMIT);

  const topicRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allVocabularyTopics
      .map((topic, i) => {
        const locked = !isPremium && i >= FREE_VOCABULARY_TOPIC_LIMIT;
        const words = listVocabulary(topic);
        const mastered = words.filter((w) => userVocabQuery.data?.[w.id]?.status === 'mastered').length;
        const status: StatusFilter = mastered === 0 ? 'not_started' : mastered === words.length ? 'mastered' : 'in_progress';
        return { topic, locked, words, mastered, status };
      })
      .filter((row) => {
        if (q && !row.topic.toLowerCase().includes(q) && !row.words.some((w) => w.word.toLowerCase().includes(q))) return false;
        if (statusFilter !== 'all' && row.status !== statusFilter) return false;
        return true;
      });
  }, [search, statusFilter, isPremium, userVocabQuery.data]);

  return (
    <Screen scroll>
      <ScreenHeader title="Vocabulary" showBack />
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.md }}>
        Topic word packs with flashcards and spaced repetition.
      </Text>

      <TextField value={search} onChangeText={setSearch} placeholder="Search topics or words..." style={{ marginBottom: theme.spacing.sm }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: theme.spacing.md }}>
        {STATUS_FILTERS.map((f) => (
          <Chip key={f.key} label={f.label} selected={statusFilter === f.key} onPress={() => setStatusFilter(f.key)} />
        ))}
      </View>

      {topicRows.length === 0 ? (
        <Text color="secondary" align="center" style={{ marginTop: theme.spacing.xl }}>
          No topics match these filters.
        </Text>
      ) : null}

      {topicRows.map(({ topic, locked, words, mastered }) => (
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
      ))}
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
