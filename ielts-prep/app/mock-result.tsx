import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { SkillBandCard } from '@/components/home/SkillBandCard';
import { Badge, BandRing, Button, Card, Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { computeOverallBand, computeWritingSkillBand } from '@/lib/bandScore';
import { firstParam } from '@/lib/firstParam';
import {
  checkAndUnlockAchievements,
  completeMockAttempt,
  getListeningAttempts,
  getMockAttempts,
  getQuestionAttempts,
  getReadingAttempts,
  getSpeakingHistory,
  getStreak,
  getWritingHistory,
  recordBandScore,
} from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import type { SkillKey } from '@/types/models';

export default function MockResultScreen() {
  const theme = useTheme();
  const router = useRouter();
  const mockAttemptId = firstParam(useLocalSearchParams<{ mockAttemptId: string }>().mockAttemptId);
  const userId = useAppStore((s) => s.userId);
  const refreshUserData = useAppStore((s) => s.refreshUserData);
  const [finalized, setFinalized] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  // Synchronous guard against the effect re-entering while a finalize() is
  // already in flight (e.g. a fast dependency re-fire before the first
  // await resolves) — see reading-test.tsx's persistingRef for the same
  // pattern and why a ref (not state) is required here.
  const finalizingRef = useRef(false);
  // Remembers which steps already landed, so Retry after a partial failure
  // (e.g. completeMockAttempt succeeded but the network dropped before
  // recordBandScore) never re-completes the attempt or double-records a
  // band for the same mock — see reading-test.tsx's persistRef.
  const finalizeStateRef = useRef<{ attemptCompleted?: boolean; bandsRecorded: Set<string>; overallRecorded?: boolean; achievementsChecked?: boolean }>({
    bandsRecorded: new Set(),
  });

  const readingQ = useQuery({ queryKey: ['reading-attempts', userId], queryFn: () => getReadingAttempts(userId!), enabled: Boolean(userId) });
  const listeningQ = useQuery({ queryKey: ['listening-attempts', userId], queryFn: () => getListeningAttempts(userId!), enabled: Boolean(userId) });
  const writingQ = useQuery({ queryKey: ['writing-history', userId], queryFn: () => getWritingHistory(userId!), enabled: Boolean(userId) });
  const speakingQ = useQuery({ queryKey: ['speaking-history', userId], queryFn: () => getSpeakingHistory(userId!), enabled: Boolean(userId) });

  const reading = readingQ.data?.find((a) => a.mockAttemptId === mockAttemptId);
  const listening = listeningQ.data?.find((a) => a.mockAttemptId === mockAttemptId);
  // A Full Mock's Writing section has TWO separate submissions (Task 1 and
  // Task 2), each recorded independently under the same mockAttemptId —
  // both must genuinely exist and be evaluated before an aggregate Writing
  // band is produced; picking just one (the previous behavior) silently
  // discarded the other task's result entirely.
  const mockWritingSubmissions = writingQ.data?.filter((w) => w.submission.mockAttemptId === mockAttemptId) ?? [];
  const writingTask1 = mockWritingSubmissions.find((w) => w.submission.taskType.startsWith('task1'));
  const writingTask2 = mockWritingSubmissions.find((w) => w.submission.taskType === 'task2');
  const writingReady = Boolean(writingTask1?.feedback && writingTask2?.feedback);
  const writingBand = writingReady
    ? computeWritingSkillBand(writingTask1!.feedback!.overallBand, writingTask2!.feedback!.overallBand)
    : null;
  const speaking = speakingQ.data?.find((s) => s.session.mockAttemptId === mockAttemptId);

  const ready = Boolean(reading && listening && writingBand != null && speaking?.feedback);

  const bands: Partial<Record<SkillKey, number>> = {
    reading: reading?.band,
    listening: listening?.band,
    writing: writingBand ?? undefined,
    speaking: speaking?.feedback?.overallBand,
  };
  const overall = ready
    ? computeOverallBand({ listening: bands.listening!, reading: bands.reading!, writing: bands.writing!, speaking: bands.speaking! })
    : null;

  /** Writes the mock's overall result (completeMockAttempt, per-skill and
   * overall band_scores, achievement unlocks). Safe to call again from the
   * Retry button after a failure — `finalizeStateRef` remembers which parts
   * already landed. Previously this set `finalized=true` before any of
   * this ran and had no try/catch at all: a single failed step (network
   * drop, RLS error) left the user stuck on this screen's report forever
   * with the mock never marked completed and no way to retry. */
  async function finalize() {
    if (!userId || overall === null || finalizingRef.current) return;
    finalizingRef.current = true;
    setFinalizeError(null);
    try {
      if (!finalizeStateRef.current.attemptCompleted) {
        await completeMockAttempt(mockAttemptId!, overall);
        finalizeStateRef.current.attemptCompleted = true;
      }
      for (const [skill, band] of Object.entries(bands)) {
        if (band === undefined || finalizeStateRef.current.bandsRecorded.has(skill)) continue;
        await recordBandScore(userId, skill as SkillKey, band, 'mock');
        finalizeStateRef.current.bandsRecorded.add(skill);
      }
      if (!finalizeStateRef.current.overallRecorded) {
        await recordBandScore(userId, 'overall', overall, 'mock');
        finalizeStateRef.current.overallRecorded = true;
      }
      if (!finalizeStateRef.current.achievementsChecked) {
        const mockAttempts = await getMockAttempts(userId);
        const streak = await getStreak(userId);
        const attempts = await getQuestionAttempts(userId);
        await checkAndUnlockAchievements(userId, {
          mockCount: mockAttempts.filter((a) => a.status === 'completed').length,
          streakDays: streak.count,
          bandBySkill: bands as any,
          writingCount: writingQ.data?.length ?? 0,
          speakingCount: speakingQ.data?.length ?? 0,
          questionCount: attempts.length,
        });
        finalizeStateRef.current.achievementsChecked = true;
      }
      await refreshUserData(userId);
      setFinalized(true);
    } catch (err) {
      setFinalizeError((err as Error).message);
    } finally {
      finalizingRef.current = false;
    }
  }

  useEffect(() => {
    if (!ready || finalized || !userId || overall === null) return;
    // Deferred to a microtask rather than called directly: finalize() sets
    // state (setFinalizeError/setFinalized), and calling that synchronously
    // from inside the effect body triggers cascading-render lint/runtime
    // warnings — see react-hooks/set-state-in-effect.
    Promise.resolve().then(() => finalize());
    // Intentionally runs once when the report becomes ready, not on every data refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, finalized]);

  if (!ready || overall === null) {
    return (
      <Screen>
        <View style={{ alignItems: 'center', marginTop: theme.spacing.xxxl, gap: theme.spacing.md }}>
          <Text variant="h3">Compiling your report...</Text>
          <Text color="secondary" align="center">
            If a section is missing, make sure you completed all four parts of the mock test.
          </Text>
          <Button label="Back to Tests" onPress={() => router.replace('/(tabs)/tests')} />
        </View>
      </Screen>
    );
  }

  const skillEntries = Object.entries(bands) as [SkillKey, number][];
  const strongest = skillEntries.reduce((a, b) => (b[1] > a[1] ? b : a));
  const weakest = skillEntries.reduce((a, b) => (b[1] < a[1] ? b : a));
  const readiness = Math.min(100, Math.round((overall / 9) * 100));

  return (
    <Screen scroll>
      {finalizeError ? (
        <Card style={{ marginBottom: theme.spacing.lg, backgroundColor: theme.colors.errorSoft, gap: theme.spacing.sm }}>
          <Text variant="bodyMedium" color="error">
            This result wasn&apos;t fully saved
          </Text>
          <Text variant="caption" color="secondary">
            {finalizeError} The report below is accurate, but it won&apos;t be marked complete in Test History or recorded toward your Home band until this is retried successfully.
          </Text>
          <Button label="Retry save" size="sm" onPress={finalize} />
        </Card>
      ) : null}
      <View style={{ alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.xl }}>
        <BandRing band={overall} size={140} strokeWidth={12} color={theme.colors.success} label="Overall Band" />
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
        {(['listening', 'reading', 'writing', 'speaking'] as SkillKey[]).map((skill) => (
          <SkillBandCard key={skill} skill={skill} band={bands[skill] ?? null} />
        ))}
      </View>

      <Card style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text color="secondary">Strongest skill</Text>
          <Badge label={strongest[0]} tone="success" />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text color="secondary">Weakest skill</Text>
          <Badge label={weakest[0]} tone="warning" />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text color="secondary">Readiness score</Text>
          <Text variant="bodyMedium">{readiness}%</Text>
        </View>
      </Card>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="bodyMedium" style={{ marginBottom: theme.spacing.xs }}>
          Recommendation
        </Text>
        <Text color="secondary">
          Your {weakest[0]} score is currently pulling your overall band down the most. Prioritise {weakest[0]} practice for the next week,
          then take another full mock test to measure progress.
        </Text>
      </Card>

      <Text variant="caption" color="tertiary" style={{ marginBottom: theme.spacing.lg }}>
        This is an AI-generated estimate for practice purposes and is not an official IELTS result.
      </Text>

      <Button label="Back to Home" onPress={() => router.replace('/(tabs)')} fullWidth style={{ marginBottom: theme.spacing.huge }} />
    </Screen>
  );
}
