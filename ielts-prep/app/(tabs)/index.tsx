import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { AiCoachFab } from '@/components/home/AiCoachFab';
import { StudyPlanItemRow } from '@/components/home/StudyPlanItemRow';
import { ProgressDashboard } from '@/components/dashboard/ProgressDashboard';
import { Button, Card, DemoAiBadge, IconCircle, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { getHomeViewState } from '@/lib/homeViewState';
import { studyPlanItemTarget } from '@/lib/studyPlanNav';
import type { CoachContext } from '@/services/ai';
import {
  completeStudyPlanItem,
  generateStudyPlan,
  getStudyPlanFocusSuggestion,
  getTestHistory,
  listMockTests,
} from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

const today = () => new Date().toISOString().slice(0, 10);

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { userId, profile, goal, bandScores, streak, xp, homeError, dataLoaded, refreshUserData } = useAppStore(useShallow((s) => ({
    userId: s.userId,
    profile: s.profile,
    goal: s.goal,
    bandScores: s.bandScores,
    streak: s.streak,
    xp: s.xp,
    homeError: s.homeError,
    dataLoaded: s.dataLoaded,
    refreshUserData: s.refreshUserData,
  })));
  const [retrying, setRetrying] = React.useState(false);

  const planQuery = useQuery({
    queryKey: ['study-plan', userId, today()],
    queryFn: () => generateStudyPlan(userId!, goal!, bandScores as any, today()),
    enabled: Boolean(userId && goal),
  });

  const historyQuery = useQuery({
    queryKey: ['test-history', userId],
    queryFn: () => getTestHistory(userId!),
    enabled: Boolean(userId),
  });

  const focusQuery = useQuery({
    queryKey: ['study-plan-focus', userId, today()],
    queryFn: () => {
      const context: CoachContext = {
        fullName: profile?.fullName ?? null,
        ieltsType: goal!.ieltsType,
        targetBand: goal!.targetBand,
        currentBand: goal!.currentBand ?? null,
        examDate: goal!.examDate ?? null,
        weakestSkill: goal!.weakestSkill ?? null,
        bandBySkill: bandScores,
        streakDays: streak.count,
        dailyStudyMinutes: goal!.dailyStudyMinutes,
      };
      return getStudyPlanFocusSuggestion(userId!, context);
    },
    enabled: Boolean(userId && goal),
  });

  async function handleRetry() {
    if (!userId) return;
    setRetrying(true);
    try {
      await refreshUserData(userId);
    } finally {
      setRetrying(false);
    }
  }

  // Home always shows the real dashboard once the initial fetch settles —
  // it must never be replaced by a full-screen "let's set up your goal"
  // state (that's now just one degraded card inside ProgressDashboard when
  // `goal` is null), and a scoped query failure (say, only the goal query)
  // must not blank the rest of the screen either. "error" is reserved for a
  // load that came back with genuinely nothing usable at all. See
  // lib/homeViewState.ts.
  const viewState = getHomeViewState({ dataLoaded, profile, homeError });

  if (viewState === 'loading') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (viewState === 'error') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.xl, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.md }}>
        <IconCircle name="alert-circle-outline" size={64} backgroundColor={theme.colors.errorSoft} color={theme.colors.error} />
        <Text variant="h3" align="center">
          Couldn&apos;t load your data
        </Text>
        <Text color="secondary" align="center">
          {homeError}
        </Text>
        <Button label="Retry" onPress={handleRetry} loading={retrying} />
      </SafeAreaView>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const freeMock = listMockTests().find((m) => m.isFree);
  const recentActivity = historyQuery.data?.slice(0, 3) ?? [];

  async function toggleItem(itemId: string, isCompleted: boolean) {
    if (!planQuery.data || isCompleted) return;
    await completeStudyPlanItem(planQuery.data.id, itemId);
    queryClient.invalidateQueries({ queryKey: ['study-plan', userId, today()] });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg }}>
      <View style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="body" color="secondary">
          {greeting},
        </Text>
        <Text variant="h1">{profile?.fullName ?? 'there'}</Text>
      </View>

      {/* A missing/failed real-time refresh degrades gracefully everywhere
          else (each field keeps its last-known value), but is still worth
          surfacing here — non-blocking, with its own retry — rather than
          silently pretending everything is current. */}
      {homeError ? (
        <Card style={{ marginBottom: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <IconCircle name="alert-circle-outline" backgroundColor={theme.colors.errorSoft} color={theme.colors.error} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">Couldn&apos;t refresh your data</Text>
            <Text variant="caption" color="secondary">
              {homeError}
            </Text>
          </View>
          <Button label="Retry" size="sm" onPress={handleRetry} loading={retrying} />
        </Card>
      ) : null}

      <ProgressDashboard onSetGoal={() => router.push('/(onboarding)/ielts-type')} onUpgrade={() => router.push('/paywall')} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
        <Text variant="h3">Today’s Study Plan</Text>
        <Text variant="caption" color="tertiary">
          {xp} XP
        </Text>
      </View>
      {goal ? (
        <Card style={{ marginBottom: theme.spacing.lg }}>
          {focusQuery.data ? (
            <View style={{ marginBottom: theme.spacing.sm, paddingBottom: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.border, gap: 4 }}>
              <Text variant="bodyMedium">{focusQuery.data.focusSummary}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.sm }}>
                <Text variant="caption" color="secondary" style={{ flex: 1 }}>
                  {focusQuery.data.motivationalNote}
                </Text>
                <DemoAiBadge source={focusQuery.data.aiSource} />
              </View>
            </View>
          ) : null}
          {planQuery.data?.items.length ? (
            planQuery.data.items.map((item) => (
              <StudyPlanItemRow
                key={item.id}
                item={item}
                onToggle={() => toggleItem(item.id, item.isCompleted)}
                onPress={() => router.push(studyPlanItemTarget(item) as any)}
              />
            ))
          ) : planQuery.isLoading ? (
            <Text color="secondary">Loading your plan...</Text>
          ) : (
            <Text color="secondary">Nothing scheduled for today — tap below to practice your weakest skill anyway.</Text>
          )}
          <Button
            label="Continue studying"
            onPress={() => router.push({ pathname: '/practice-session', params: { skill: goal.weakestSkill ?? 'reading' } })}
            style={{ marginTop: theme.spacing.sm }}
            fullWidth
          />
        </Card>
      ) : (
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <Text color="secondary">Set up your study goal to get a personalized daily study plan.</Text>
          <Button label="Set up my goal" onPress={() => router.push('/(onboarding)/ielts-type')} style={{ marginTop: theme.spacing.sm }} />
        </Card>
      )}

      {freeMock ? (
        <Card
          onPress={() => router.push({ pathname: '/mock-test', params: { mockTestId: freeMock.id } })}
          style={{ marginBottom: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
        >
          <IconCircle name="document-text-outline" />
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">Recommended: {freeMock.title}</Text>
            <Text variant="caption" color="secondary">
              A full timed mock test across all four skills
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
        </Card>
      ) : null}

      <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>
        Recent activity
      </Text>
      <Card style={{ marginBottom: theme.spacing.lg }}>
        {recentActivity.length === 0 ? (
          <Text color="secondary">No activity yet — complete a practice session to see it here.</Text>
        ) : (
          recentActivity.map((entry, i) => (
            <View
              key={entry.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: theme.spacing.xs,
                borderBottomWidth: i < recentActivity.length - 1 ? 1 : 0,
                borderBottomColor: theme.colors.border,
              }}
            >
              <Text variant="body" style={{ textTransform: 'capitalize' }}>
                {entry.activityType.replace('_', ' ')}
              </Text>
              <Text variant="body" color="secondary">
                {entry.band ? `Band ${entry.band.toFixed(1)}` : '—'}
              </Text>
            </View>
          ))
        )}
      </Card>

      {goal?.weakestSkill ? (
        <Card style={{ marginBottom: theme.spacing.huge, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <IconCircle name="bulb-outline" backgroundColor={theme.colors.warningSoft} color={theme.colors.warning} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">Focus area: {goal.weakestSkill}</Text>
            <Text variant="caption" color="secondary">
              Ask the AI Coach how to improve this skill fastest.
            </Text>
          </View>
        </Card>
      ) : null}
      </ScrollView>
      <AiCoachFab />
    </SafeAreaView>
  );
}
