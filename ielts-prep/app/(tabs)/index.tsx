import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { AiCoachFab } from '@/components/home/AiCoachFab';
import { SkillBandCard } from '@/components/home/SkillBandCard';
import { StudyPlanItemRow } from '@/components/home/StudyPlanItemRow';
import { Badge, Button, Card, IconCircle, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { studyPlanItemTarget } from '@/lib/studyPlanNav';
import {
  completeStudyPlanItem,
  generateStudyPlan,
  getTestHistory,
  listMockTests,
} from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import type { SkillKey } from '@/types/models';

const today = () => new Date().toISOString().slice(0, 10);

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000));
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { userId, profile, goal, bandScores, streak, xp } = useAppStore(useShallow((s) => ({
    userId: s.userId,
    profile: s.profile,
    goal: s.goal,
    bandScores: s.bandScores,
    streak: s.streak,
    xp: s.xp,
  })));

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

  if (!goal) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const days = daysUntil(goal.examDate);
  const overall = bandScores.overall;
  const skills: SkillKey[] = ['listening', 'reading', 'writing', 'speaking'];
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.lg }}>
        <View>
          <Text variant="body" color="secondary">
            {greeting},
          </Text>
          <Text variant="h1">{profile?.fullName ?? 'there'}</Text>
        </View>
        <Button label={`🔥 ${streak.count}`} variant="secondary" size="sm" onPress={() => router.push('/analytics')} />
      </View>

      <Card elevation="md" style={{ marginBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text variant="caption" color="secondary">
              Target band
            </Text>
            <Text variant="h1" color="brand">
              {goal.targetBand.toFixed(1)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="caption" color="secondary">
              Predicted band
            </Text>
            <Text variant="h1">{overall ? overall.toFixed(1) : '—'}</Text>
          </View>
        </View>
        {days !== null ? (
          <Badge label={`${days} days until your test`} tone="brand" />
        ) : (
          <Badge label="No test date set" tone="neutral" />
        )}
      </Card>

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
        {skills.map((skill) => (
          <SkillBandCard key={skill} skill={skill} band={bandScores[skill] ?? null} onPress={() => router.push('/analytics')} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
        <Text variant="h3">Today’s Study Plan</Text>
        <Text variant="caption" color="tertiary">
          {xp} XP
        </Text>
      </View>
      <Card style={{ marginBottom: theme.spacing.lg }}>
        {planQuery.data?.items.length ? (
          planQuery.data.items.map((item) => (
            <StudyPlanItemRow
              key={item.id}
              item={item}
              onToggle={() => toggleItem(item.id, item.isCompleted)}
              onPress={() => router.push(studyPlanItemTarget(item) as any)}
            />
          ))
        ) : (
          <Text color="secondary">Loading your plan...</Text>
        )}
        <Button
          label="Continue studying"
          onPress={() => router.push({ pathname: '/practice-session', params: { skill: goal.weakestSkill ?? 'reading' } })}
          style={{ marginTop: theme.spacing.sm }}
          fullWidth
        />
      </Card>

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

      {goal.weakestSkill ? (
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
