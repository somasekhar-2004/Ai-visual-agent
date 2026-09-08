import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { MiniLineChart } from '@/components/analytics/MiniLineChart';
import { WeeklyBarChart } from '@/components/analytics/WeeklyBarChart';
import { SkillBandCard } from '@/components/home/SkillBandCard';
import { Badge, Card, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { accuracyByQuestionType, overallAccuracy, weeklyActivityCounts } from '@/lib/analytics';
import { getBandScoreHistory, getQuestionAttempts, getTestHistory } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import type { SkillKey } from '@/types/models';

export default function AnalyticsScreen() {
  const theme = useTheme();
  const { userId, goal, bandScores, streak } = useAppStore(useShallow((s) => ({
    userId: s.userId,
    goal: s.goal,
    bandScores: s.bandScores,
    streak: s.streak,
  })));

  const attemptsQuery = useQuery({ queryKey: ['question-attempts', userId], queryFn: () => getQuestionAttempts(userId!), enabled: Boolean(userId) });
  const historyQuery = useQuery({ queryKey: ['test-history', userId], queryFn: () => getTestHistory(userId!), enabled: Boolean(userId) });
  const bandHistoryQuery = useQuery({ queryKey: ['band-history', userId], queryFn: () => getBandScoreHistory(userId!), enabled: Boolean(userId) });

  const overallHistory = (bandHistoryQuery.data ?? []).filter((b) => b.skill === 'overall').map((b) => b.band);
  const accuracy = overallAccuracy(attemptsQuery.data ?? []);
  const typeAccuracy = accuracyByQuestionType(attemptsQuery.data ?? []);
  const weekly = weeklyActivityCounts(historyQuery.data ?? []);
  const readiness = goal ? Math.min(100, Math.round(((bandScores.overall ?? 0) / goal.targetBand) * 100)) : 0;

  return (
    <Screen scroll>
      <ScreenHeader title="Progress & Analytics" showBack />

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
        {(['listening', 'reading', 'writing', 'speaking'] as SkillKey[]).map((skill) => (
          <SkillBandCard key={skill} skill={skill} band={bandScores[skill] ?? null} />
        ))}
      </View>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
          <Text variant="h3">Target progress</Text>
          <Badge label={`${readiness}% ready`} tone={readiness >= 90 ? 'success' : 'brand'} />
        </View>
        <ProgressBar progress={readiness / 100} />
        <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing.xs }}>
          Predicted band {(bandScores.overall ?? 0).toFixed(1)} of target {goal?.targetBand.toFixed(1)}
        </Text>
      </Card>

      <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>
        Predicted band over time
      </Text>
      <Card style={{ marginBottom: theme.spacing.lg }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <MiniLineChart values={overallHistory} />
        </ScrollView>
      </Card>

      <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>
        Weekly activity
      </Text>
      <Card style={{ marginBottom: theme.spacing.lg }}>
        <WeeklyBarChart data={weekly} />
      </Card>

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
        <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text variant="h2">{Math.round(accuracy * 100)}%</Text>
          <Text variant="caption" color="secondary">
            Overall accuracy
          </Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text variant="h2">🔥 {streak.count}</Text>
          <Text variant="caption" color="secondary">
            Day streak
          </Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text variant="h2">{attemptsQuery.data?.length ?? 0}</Text>
          <Text variant="caption" color="secondary">
            Questions done
          </Text>
        </Card>
      </View>

      <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>
        Question-type analytics
      </Text>
      <Card style={{ marginBottom: theme.spacing.huge }}>
        {typeAccuracy.length === 0 ? (
          <Text color="secondary">Answer some practice questions to see a breakdown by question type.</Text>
        ) : (
          typeAccuracy.map((t) => (
            <View key={t.type} style={{ marginBottom: theme.spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text variant="body" style={{ textTransform: 'capitalize' }}>
                  {t.type.replace(/_/g, ' ')}
                </Text>
                <Text variant="body" color="secondary">
                  {Math.round(t.accuracy * 100)}%
                </Text>
              </View>
              <ProgressBar progress={t.accuracy} color={t.accuracy < 0.6 ? theme.colors.warning : theme.colors.success} />
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}
