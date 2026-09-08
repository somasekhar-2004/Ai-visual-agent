import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Badge, Button, Card, Chip, IconCircle, Screen, ScreenHeader, Text, TextField } from '@/components/ui';
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
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(() => Array.from(new Set(lessons.map((l) => l.category))), [lessons]);

  const indexedLessons = useMemo(() => lessons.map((lesson, i) => ({ lesson, i })), [lessons]);
  const filteredLessons = useMemo(() => {
    const q = search.trim().toLowerCase();
    return indexedLessons.filter(({ lesson }) => {
      if (category !== 'all' && lesson.category !== category) return false;
      if (q && !lesson.title.toLowerCase().includes(q) && !lesson.category.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [indexedLessons, search, category]);

  return (
    <Screen scroll>
      <ScreenHeader title="Grammar" showBack />
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.md }}>
        Targeted lessons on the grammar patterns that matter most for IELTS.
      </Text>

      <Button
        label="Practice questions on your weak topics"
        variant="secondary"
        onPress={() => router.push({ pathname: '/grammar-practice', params: { mode: 'weak' } })}
        style={{ marginBottom: theme.spacing.md }}
        fullWidth
      />

      <TextField value={search} onChangeText={setSearch} placeholder="Search lessons..." style={{ marginBottom: theme.spacing.sm }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: theme.spacing.md }}>
        <Chip label="All topics" selected={category === 'all'} onPress={() => setCategory('all')} />
        {categories.map((c) => (
          <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>

      {filteredLessons.length === 0 ? (
        <Text color="secondary" align="center" style={{ marginTop: theme.spacing.xl }}>
          No lessons match these filters.
        </Text>
      ) : null}

      {filteredLessons.map(({ lesson, i }) => {
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
