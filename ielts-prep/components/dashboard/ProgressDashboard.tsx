import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { MiniLineChart } from '@/components/analytics/MiniLineChart';
import { WeeklyBarChart } from '@/components/analytics/WeeklyBarChart';
import { SkillBandCard } from '@/components/home/SkillBandCard';
import { Badge, Button, Card, IconCircle, ProgressBar, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import {
  accuracyByQuestionType,
  activityCountInWindow,
  criterionTrend,
  estimatedMinutesStudied,
  overallAccuracy,
  weakestAndStrongestSkill,
  weeklyActivityCounts,
} from '@/lib/analytics';
import { getBandScoreHistory, getQuestionAttempts, getTestHistory } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import type { SkillKey } from '@/types/models';

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
}

const WRITING_CRITERIA: { key: string; label: string }[] = [
  { key: 'taskAchievement', label: 'Task Achievement' },
  { key: 'coherenceCohesion', label: 'Coherence & Cohesion' },
  { key: 'lexicalResource', label: 'Lexical Resource' },
  { key: 'grammaticalRange', label: 'Grammatical Range' },
];
const SPEAKING_CRITERIA: { key: string; label: string }[] = [
  { key: 'fluencyCoherence', label: 'Fluency & Coherence' },
  { key: 'lexicalResource', label: 'Lexical Resource' },
  { key: 'grammaticalRange', label: 'Grammatical Range' },
  { key: 'pronunciation', label: 'Pronunciation' },
];

/**
 * The single source of truth for the app's progress/analytics dashboard —
 * used as the main content of both the Home tab and (for anyone who still
 * finds their way to it) the standalone Progress & Analytics screen. All
 * data here comes from the user's actual practice/test history and band
 * scores, independent of whether they have an active study goal — only the
 * "Target progress" card depends on `goal`, and degrades to a setup CTA
 * instead of disappearing (or taking the rest of the dashboard with it)
 * when there isn't one.
 */
export function ProgressDashboard({ onSetGoal, onUpgrade }: { onSetGoal: () => void; onUpgrade: () => void }) {
  const theme = useTheme();
  const { userId, goal, bandScores, streak, isPremium } = useAppStore(useShallow((s) => ({
    userId: s.userId,
    goal: s.goal,
    bandScores: s.bandScores,
    streak: s.streak,
    isPremium: s.subscription?.plan !== 'free',
  })));

  const attemptsQuery = useQuery({ queryKey: ['question-attempts', userId], queryFn: () => getQuestionAttempts(userId!), enabled: Boolean(userId) });
  const historyQuery = useQuery({ queryKey: ['test-history', userId], queryFn: () => getTestHistory(userId!), enabled: Boolean(userId) });
  const bandHistoryQuery = useQuery({ queryKey: ['band-history', userId], queryFn: () => getBandScoreHistory(userId!), enabled: Boolean(userId) });

  const overallHistory = (bandHistoryQuery.data ?? []).filter((b) => b.skill === 'overall').map((b) => b.band);
  const accuracy = overallAccuracy(attemptsQuery.data ?? []);
  const typeAccuracy = accuracyByQuestionType(attemptsQuery.data ?? []);
  const weekly = weeklyActivityCounts(historyQuery.data ?? []);
  const readiness = goal ? Math.min(100, Math.round(((bandScores.overall ?? 0) / goal.targetBand) * 100)) : 0;
  const targetGap = goal ? Math.max(0, Math.round((goal.targetBand - (bandScores.overall ?? 0)) * 2) / 2) : null;
  const { weakest, strongest } = weakestAndStrongestSkill(bandScores);
  const last7 = activityCountInWindow(historyQuery.data ?? [], 7);
  const last30 = activityCountInWindow(historyQuery.data ?? [], 30);
  const minutesStudied = estimatedMinutesStudied(historyQuery.data ?? []);
  const days = daysUntil(goal?.examDate);

  // A failed analytics query must never be reported as "0% accuracy" or "no
  // activity yet" — those are real, meaningful zero states for a user with
  // no practice history, and a silent query failure must not look identical
  // to one. Each affected stat still renders its best-effort (zeroed) value
  // below (matching this dashboard's existing degrade-gracefully behavior),
  // but this banner makes clear that value is not to be trusted.
  const hasAnalyticsQueryError = attemptsQuery.isError || historyQuery.isError || bandHistoryQuery.isError;

  return (
    <>
      {hasAnalyticsQueryError ? (
        <Card style={{ marginBottom: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <IconCircle name="alert-circle-outline" backgroundColor={theme.colors.warningSoft} color={theme.colors.warning} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">Some progress stats couldn&apos;t load</Text>
            <Text variant="caption" color="secondary">
              The numbers below may be incomplete. Pull to refresh or try again shortly.
            </Text>
          </View>
        </Card>
      ) : null}

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
        {goal ? (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: theme.spacing.sm }}>
              <Badge label={goal.ieltsType === 'academic' ? 'IELTS Academic' : 'IELTS General Training'} tone="brand" />
              {days !== null ? <Badge label={`${days} days until your test`} tone="brand" /> : <Badge label="No exam date yet" tone="neutral" />}
            </View>
            <ProgressBar progress={readiness / 100} />
            <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing.xs }}>
              Predicted band {(bandScores.overall ?? 0).toFixed(1)} of target {goal.targetBand.toFixed(1)}
              {targetGap != null ? ` — ${targetGap > 0 ? `${targetGap.toFixed(1)} band(s) to go` : 'target reached'}` : ''}
            </Text>
            {weakest || strongest ? (
              <View style={{ flexDirection: 'row', gap: theme.spacing.xs, marginTop: theme.spacing.sm }}>
                {weakest ? <Badge label={`Weakest: ${weakest[0].toUpperCase()}${weakest.slice(1)}`} tone="warning" /> : null}
                {strongest ? <Badge label={`Strongest: ${strongest[0].toUpperCase()}${strongest.slice(1)}`} tone="success" /> : null}
              </View>
            ) : null}
          </>
        ) : (
          <>
            <Text color="secondary">Set a target band and exam date to track your readiness here.</Text>
            <Button label="Set up my goal" onPress={onSetGoal} style={{ marginTop: theme.spacing.sm }} />
          </>
        )}
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

      {isPremium ? (
        <>
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
              <Text variant="h2">{last7}</Text>
              <Text variant="caption" color="secondary">
                Activities (7 days)
              </Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <Text variant="h2">{last30}</Text>
              <Text variant="caption" color="secondary">
                Activities (30 days)
              </Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <Text variant="h2">{minutesStudied}</Text>
              <Text variant="caption" color="secondary">
                Minutes studied (est.)
              </Text>
            </Card>
          </View>

          <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            Writing by criterion
          </Text>
          <Card style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.sm }}>
            {(() => {
              const rows = WRITING_CRITERIA.map((c) => ({ ...c, trend: criterionTrend(historyQuery.data ?? [], 'writing', c.key) }));
              const hasAny = rows.some((r) => r.trend.length > 0);
              if (!hasAny) return <Text color="secondary">Submit a writing task to see a breakdown by criterion.</Text>;
              return rows.map((c) => {
                const latest = c.trend[c.trend.length - 1];
                return (
                  <View key={c.key}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text variant="body">{c.label}</Text>
                      <Text variant="body" color="secondary">
                        {latest != null ? latest.toFixed(1) : '—'}
                      </Text>
                    </View>
                    <ProgressBar progress={(latest ?? 0) / 9} />
                  </View>
                );
              });
            })()}
          </Card>

          <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            Speaking by criterion
          </Text>
          <Card style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.sm }}>
            {(() => {
              const rows = SPEAKING_CRITERIA.map((c) => ({ ...c, trend: criterionTrend(historyQuery.data ?? [], 'speaking', c.key) }));
              const hasAny = rows.some((r) => r.trend.length > 0);
              if (!hasAny) return <Text color="secondary">Complete a speaking session to see a breakdown by criterion.</Text>;
              return rows.map((c) => {
                const latest = c.trend[c.trend.length - 1];
                return (
                  <View key={c.key}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text variant="body">{c.label}</Text>
                      <Text variant="body" color="secondary">
                        {latest != null ? latest.toFixed(1) : '—'}
                      </Text>
                    </View>
                    <ProgressBar progress={(latest ?? 0) / 9} />
                  </View>
                );
              });
            })()}
          </Card>

          <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            Question-type analytics
          </Text>
          <Card style={{ marginBottom: theme.spacing.lg }}>
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
        </>
      ) : (
        <Card style={{ alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
          <IconCircle name="stats-chart" size={48} backgroundColor={theme.colors.warningSoft} color={theme.colors.warning} />
          <Text variant="bodyMedium" align="center">
            Unlock advanced analytics
          </Text>
          <Text variant="caption" color="secondary" align="center">
            Premium adds your predicted-band trend, weekly/monthly activity, minutes studied, Writing &amp; Speaking breakdowns by criterion, and question-type accuracy.
          </Text>
          <Button label="Upgrade to Premium" onPress={onUpgrade} fullWidth />
        </Card>
      )}
    </>
  );
}
