import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Badge, Card, Chip, IconCircle, Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { content } from '@/lib/content';
import { getMockAttempts, listMockTests } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import type { Difficulty, IeltsType, MockAttempt } from '@/types/models';

const SECTION_TESTS: { title: string; description: string; icon: keyof typeof Ionicons.glyphMap; href: string }[] = [
  { title: 'Reading test', description: '1-3 passages, timed, examiner-style interface', icon: 'book-outline', href: '/reading-test' },
  { title: 'Listening test', description: 'Multiple sections, real audio playback', icon: 'headset-outline', href: '/listening-test' },
  { title: 'Writing test', description: 'Task 1 or Task 2, timed with AI evaluation', icon: 'create-outline', href: '/writing-test' },
  { title: 'Speaking test', description: 'AI examiner across Parts 1, 2 and 3', icon: 'mic-outline', href: '/speaking-session' },
];

const DIFFICULTY_TONE: Record<Difficulty, 'success' | 'warning' | 'error'> = { easy: 'success', medium: 'warning', hard: 'error' };
const IELTS_TYPE_LABEL: Record<IeltsType, string> = { academic: 'Academic', general: 'General Training' };

function bestBand(attempts: MockAttempt[]): number | null {
  const completed = attempts.filter((a) => a.status === 'completed' && a.overallBand != null);
  if (!completed.length) return null;
  return Math.max(...completed.map((a) => a.overallBand as number));
}

function lastAttempt(attempts: MockAttempt[]): MockAttempt | null {
  if (!attempts.length) return null;
  return [...attempts].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];
}

type CompletedFilter = 'all' | 'completed' | 'not_completed';
type AccessFilter = 'all' | 'free' | 'premium';

export default function TestsHubScreen() {
  const theme = useTheme();
  const router = useRouter();
  const userId = useAppStore((s) => s.userId);
  const isPremium = useAppStore((s) => s.subscription?.plan !== 'free');
  const mockTests = listMockTests();
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [completedFilter, setCompletedFilter] = useState<CompletedFilter>('all');
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');

  const attemptsQuery = useQuery({
    queryKey: ['mock-attempts', userId],
    queryFn: () => getMockAttempts(userId!),
    enabled: Boolean(userId),
  });
  const attemptsByTest = useMemo(() => {
    const map = new Map<string, MockAttempt[]>();
    for (const attempt of attemptsQuery.data ?? []) {
      const list = map.get(attempt.mockTestId) ?? [];
      list.push(attempt);
      map.set(attempt.mockTestId, list);
    }
    return map;
  }, [attemptsQuery.data]);

  const filteredTests = useMemo(() => {
    return mockTests.filter((test) => {
      if (difficultyFilter !== 'all' && test.difficulty !== difficultyFilter) return false;
      if (accessFilter !== 'all' && (accessFilter === 'free') !== test.isFree) return false;
      if (completedFilter !== 'all') {
        const completed = (attemptsByTest.get(test.id) ?? []).some((a) => a.status === 'completed');
        if (completedFilter === 'completed' && !completed) return false;
        if (completedFilter === 'not_completed' && completed) return false;
      }
      return true;
    });
  }, [mockTests, difficultyFilter, accessFilter, completedFilter, attemptsByTest]);

  const grouped = useMemo(() => {
    const byType: Record<IeltsType, typeof mockTests> = { academic: [], general: [] };
    for (const test of filteredTests) byType[test.ieltsType].push(test);
    byType.academic.sort((a, b) => a.testNumber - b.testNumber);
    byType.general.sort((a, b) => a.testNumber - b.testNumber);
    return byType;
  }, [filteredTests]);

  function renderMockTest(test: (typeof mockTests)[number]) {
    const attempts = attemptsByTest.get(test.id) ?? [];
    const completed = attempts.some((a) => a.status === 'completed');
    const best = bestBand(attempts);
    const last = lastAttempt(attempts);
    const locked = !test.isFree && !isPremium;

    return (
      <Card
        key={test.id}
        onPress={() => router.push({ pathname: '/mock-test', params: { mockTestId: test.id } })}
        style={{ marginBottom: theme.spacing.md, gap: theme.spacing.xs }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <IconCircle name={completed ? 'checkmark-circle' : 'albums-outline'} color={completed ? theme.colors.success : undefined} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">
              Test {test.testNumber}: {test.title}
            </Text>
            <Text variant="caption" color="secondary" style={{ textTransform: 'capitalize' }}>
              {content.mockSections.filter((s) => s.mockTestId === test.id).length} sections
              {last ? ` • Last attempt ${new Date(last.startedAt).toLocaleDateString()}` : ' • Not attempted yet'}
            </Text>
          </View>
          {locked ? <Ionicons name="lock-closed" size={18} color={theme.colors.textTertiary} /> : null}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
          <Badge label={IELTS_TYPE_LABEL[test.ieltsType]} tone="neutral" />
          <Badge label={test.difficulty} tone={DIFFICULTY_TONE[test.difficulty]} />
          {test.isFree ? <Badge label="Free" tone="success" /> : <Badge label="Premium" tone="brand" />}
          {completed ? <Badge label="Completed" tone="success" /> : null}
          {best != null ? <Badge label={`Best band ${best.toFixed(1)}`} tone="brand" /> : null}
        </View>
      </Card>
    );
  }

  return (
    <Screen scroll>
      <Text variant="h1" style={{ marginBottom: theme.spacing.xs }}>
        Tests
      </Text>
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
        Full IELTS-style mock tests and section-specific timed tests.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: theme.spacing.xs }}>
        <Chip label="All difficulty" selected={difficultyFilter === 'all'} onPress={() => setDifficultyFilter('all')} />
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
          <Chip key={d} label={d} selected={difficultyFilter === d} onPress={() => setDifficultyFilter(d)} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: theme.spacing.xs }}>
        <Chip label="All" selected={completedFilter === 'all'} onPress={() => setCompletedFilter('all')} />
        <Chip label="Completed" selected={completedFilter === 'completed'} onPress={() => setCompletedFilter('completed')} />
        <Chip label="Not completed" selected={completedFilter === 'not_completed'} onPress={() => setCompletedFilter('not_completed')} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: theme.spacing.md }}>
        <Chip label="Free + Premium" selected={accessFilter === 'all'} onPress={() => setAccessFilter('all')} />
        <Chip label="Free" selected={accessFilter === 'free'} onPress={() => setAccessFilter('free')} />
        <Chip label="Premium" selected={accessFilter === 'premium'} onPress={() => setAccessFilter('premium')} />
      </View>

      <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>
        Academic full mock tests
      </Text>
      {grouped.academic.length === 0 ? (
        <Text color="secondary" style={{ marginBottom: theme.spacing.md }}>
          No academic mocks match these filters.
        </Text>
      ) : (
        grouped.academic.map(renderMockTest)
      )}

      <Text variant="h3" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.sm }}>
        General Training full mock tests
      </Text>
      {grouped.general.length === 0 ? (
        <Text color="secondary" style={{ marginBottom: theme.spacing.md }}>
          No General Training mocks match these filters.
        </Text>
      ) : (
        grouped.general.map(renderMockTest)
      )}

      <Text variant="h3" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.sm }}>
        Section-specific tests
      </Text>
      {SECTION_TESTS.map((t) => (
        <Card
          key={t.title}
          onPress={() => router.push(t.href as any)}
          style={{ marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
        >
          <IconCircle name={t.icon} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">{t.title}</Text>
            <Text variant="caption" color="secondary">
              {t.description}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
        </Card>
      ))}

      <Card
        onPress={() => router.push('/test-history')}
        style={{ marginBottom: theme.spacing.huge, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
      >
        <IconCircle name="time-outline" />
        <View style={{ flex: 1 }}>
          <Text variant="bodyMedium">Test history</Text>
          <Text variant="caption" color="secondary">
            View all past attempts and detailed reports
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
      </Card>
    </Screen>
  );
}
