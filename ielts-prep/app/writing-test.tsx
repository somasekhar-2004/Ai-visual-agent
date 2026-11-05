import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { WritingFeedbackView } from '@/components/testing/WritingFeedbackView';
import { WritingChart } from '@/components/writing/WritingChart';
import { Badge, Button, Card, DailyLimitCard, IconCircle, Text } from '@/components/ui';
import { useCountdown } from '@/hooks/useCountdown';
import { useTheme } from '@/hooks/useTheme';
import { content } from '@/lib/content';
import { confirmAsync } from '@/lib/confirm';
import { activityUsedToday, checkDailyLimit, FREE_DAILY_WRITING_PRACTICE_EVALS } from '@/lib/entitlements';
import { firstParam } from '@/lib/firstParam';
import { nextFlowHref } from '@/lib/mockFlow';
import { stableOperationId } from '@/lib/operationId';
import { countWords } from '@/lib/textAnalysis';
import { assessWritingEvidence } from '@/lib/writingEvidence';
import { evaluateWriting, getAiProviderName, type WritingEvaluationResult } from '@/services/ai';
import {
  getTestHistory,
  recordBandScore,
  recordDailyActivity,
  refreshOverallBand,
  saveWritingFeedback,
  submitWriting,
} from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import type { WritingSubmission } from '@/types/models';
import { useShallow } from 'zustand/react/shallow';

type Params = { promptId?: string; mockAttemptId?: string; mockTestId?: string; stepIndex?: string; nextHref?: string };

export default function WritingTestScreen() {
  const theme = useTheme();
  const router = useRouter();
  const raw = useLocalSearchParams<Params>();
  const promptId = firstParam(raw.promptId);
  const mockAttemptId = firstParam(raw.mockAttemptId);
  const mockTestId = firstParam(raw.mockTestId);
  const stepIndex = firstParam(raw.stepIndex);
  const nextHref =
    mockTestId && mockAttemptId && stepIndex != null
      ? nextFlowHref(mockTestId, mockAttemptId, Number(stepIndex))
      : firstParam(raw.nextHref);
  const { userId, ieltsType, isPremium, refreshUserData } = useAppStore(useShallow((s) => ({
    userId: s.userId,
    ieltsType: s.goal?.ieltsType ?? 'academic',
    isPremium: s.subscription?.plan !== 'free',
    refreshUserData: s.refreshUserData,
  })));
  const queryClient = useQueryClient();
  // Only enforce the free daily limit for standalone practice — a writing
  // task that's part of an already-unlocked mock attempt must not be
  // blocked mid-mock.
  const isStandalone = !mockAttemptId;
  const historyQuery = useQuery({
    queryKey: ['test-history', userId],
    queryFn: () => getTestHistory(userId!),
    enabled: Boolean(userId) && isStandalone,
  });
  const limitStatus = checkDailyLimit(activityUsedToday(historyQuery.data ?? [], 'writing'), FREE_DAILY_WRITING_PRACTICE_EVALS, isPremium);
  const blockedByLimit = isStandalone && !limitStatus.allowed;

  const prompt = useMemo(
    () => content.writingPrompts.find((p) => p.id === promptId) ?? content.writingPrompts.find((p) => p.ieltsType === ieltsType && p.taskType === 'task2') ?? content.writingPrompts[0],
    [promptId, ieltsType]
  );
  const draftKey = `ielts-prep/writing-draft/${prompt.id}`;

  const [essay, setEssay] = useState('');
  const [startTime] = useState(() => Date.now());
  const [phase, setPhase] = useState<'writing' | 'evaluating' | 'result' | 'insufficient_evidence' | 'error'>('writing');
  const [evaluation, setEvaluation] = useState<WritingEvaluationResult | null>(null);
  const [insufficientEvidence, setInsufficientEvidence] = useState<{ reason: string; explanation: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // See reading-test.tsx's submittingRef for why this must be a ref, not state.
  const submittingRef = useRef(false);
  // Retrying after a failed evaluateWriting call (the "Try again" button)
  // re-runs doSubmit() from scratch. Without this, every retry of the exact
  // same unchanged essay called submitWriting() again, inserting another
  // writing_submissions row for the one real essay — see the Bandpath
  // recovery handover's item 5. Keyed by a content-stable operation ID
  // (lib/operationId.ts): retrying the same essay reuses the same DB row;
  // editing the essay and submitting again (a genuinely new attempt) gets a
  // fresh one.
  const lastSubmissionRef = useRef<{ operationId: string; submission: WritingSubmission } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(draftKey).then((saved) => {
      if (saved) setEssay(saved);
    });
  }, [draftKey]);

  useEffect(() => {
    AsyncStorage.setItem(draftKey, essay).catch(() => {});
  }, [essay, draftKey]);

  const wordCount = countWords(essay);
  const isEmpty = essay.trim().length === 0;
  const belowMinimum = wordCount < prompt.minWords;

  async function handleExit() {
    const confirmed = await confirmAsync('Exit test?', 'Your draft is saved locally, but this submission will not be recorded. Are you sure you want to exit?', 'Exit');
    if (confirmed) router.back();
  }

  async function handleSubmit() {
    if (belowMinimum) {
      const confirmed = await confirmAsync(
        'Below minimum word count',
        `You've written ${wordCount} words — the minimum is ${prompt.minWords}. Submitting a short response will lower your Task Achievement score. Submit anyway?`,
        'Submit anyway'
      );
      if (!confirmed) return;
    }
    doSubmit();
  }

  async function doSubmit() {
    if (!userId || submittingRef.current) return;
    // Guards the auto-submit-on-timeout path too (useCountdown's callback
    // below calls doSubmit() directly, bypassing handleSubmit's "Submit
    // anyway?" confirmation entirely) — an empty/whitespace-only essay
    // must never create a submission row at all, not just fail the
    // evidence gate after already writing one.
    if (isEmpty) {
      const evidence = assessWritingEvidence(0);
      if (!evidence.sufficient) setInsufficientEvidence({ reason: evidence.reason, explanation: evidence.explanation });
      setPhase('insufficient_evidence');
      return;
    }
    submittingRef.current = true;
    setPhase('evaluating');
    try {
      const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
      const operationId = stableOperationId([userId, prompt.id, mockAttemptId, essay]);
      let submission: WritingSubmission;
      if (lastSubmissionRef.current?.operationId === operationId) {
        // Same user + prompt + mock attempt + exact essay text as the
        // previous attempt — this is a retry of that same submission, not a
        // new one. Reuse its row instead of inserting a duplicate.
        submission = lastSubmissionRef.current.submission;
      } else {
        submission = await submitWriting(userId, {
          mockAttemptId,
          promptId: prompt.id,
          taskType: prompt.taskType,
          essayText: essay,
          wordCount,
          timeSpentSeconds,
        });
        lastSubmissionRef.current = { operationId, submission };
      }

      // Mandatory gate, run before any provider (real or mock) is ever
      // asked for a band — see lib/writingEvidence.ts. A blank or
      // near-blank submission must never receive a normal-looking band.
      const evidence = assessWritingEvidence(wordCount);
      if (!evidence.sufficient) {
        setInsufficientEvidence({ reason: evidence.reason, explanation: evidence.explanation });
        await AsyncStorage.removeItem(draftKey);
        setPhase('insufficient_evidence');
        return;
      }

      const result = await evaluateWriting({
        taskType: prompt.taskType,
        promptText: prompt.promptText,
        essayText: essay,
        wordCount,
        minWords: prompt.minWords,
        // The server verifies this independently before counting it
        // against the separate Full Mock quota — see WritingEvalInput.
        mockAttemptId: mockAttemptId ?? null,
        operationId,
      });
      setEvaluation(result);
      await saveWritingFeedback(submission.id, userId, {
        overallBand: result.overallBand,
        taskAchievement: result.taskAchievement,
        coherenceCohesion: result.coherenceCohesion,
        lexicalResource: result.lexicalResource,
        grammaticalRange: result.grammaticalRange,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        suggestions: result.suggestions,
        improvedExample: result.improvedExample,
        aiModel: result.aiSource === 'real' ? getAiProviderName() : 'mock',
      });
      await AsyncStorage.removeItem(draftKey);
      // Only once the essay has actually been submitted, passed the
      // sufficient-evidence gate above, and been evaluated and saved — the
      // same "genuinely complete" bar Reading/Listening/Speaking already
      // use, not merely having typed something and pressed Submit.
      await recordDailyActivity(userId, 20);
      // Standalone only — a Full Mock's Writing task is aggregated and
      // recorded by mock-result.tsx once the whole mock finishes (it needs
      // both Task 1 and Task 2 to produce one Writing band), not here.
      if (isStandalone) {
        await recordBandScore(userId, 'writing', result.overallBand, 'practice');
        await refreshOverallBand(userId).catch((err) => console.warn('[writing-test] refreshOverallBand failed:', (err as Error).message));
      }
      queryClient.invalidateQueries({ queryKey: ['test-history', userId] });
      await refreshUserData(userId);
      setPhase('result');
    } catch (err) {
      // A real evaluator failure must surface visibly, never leave the
      // screen stuck on "Evaluating..." and never fall back to a fabricated
      // score — see services/ai/index.ts's evaluateWriting.
      setErrorMessage((err as Error).message);
      setPhase('error');
    }
  }

  const { label: timerLabel, isExpired } = useCountdown(prompt.timeLimitMinutes * 60, () => phase === 'writing' && doSubmit());

  if (phase === 'evaluating') {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, gap: theme.spacing.md }}
      >
        <Text variant="h3" align="center">Evaluating your writing...</Text>
        <Text color="secondary" align="center">Checking Task Achievement, Coherence, Vocabulary, and Grammar.</Text>
      </SafeAreaView>
    );
  }

  if (phase === 'result' && evaluation) {
    return (
      <WritingFeedbackView
        evaluation={evaluation}
        onDone={() => (nextHref ? router.replace(nextHref as any) : router.replace('/(tabs)/tests'))}
      />
    );
  }

  if (phase === 'insufficient_evidence' && insufficientEvidence) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, gap: theme.spacing.md }}>
        <IconCircle name="document-outline" size={72} backgroundColor={theme.colors.warningSoft} color={theme.colors.warning} />
        <Text variant="h3" align="center">
          {insufficientEvidence.reason}
        </Text>
        <Text color="secondary" align="center">
          {insufficientEvidence.explanation}
        </Text>
        <Button label="Done" onPress={() => (nextHref ? router.replace(nextHref as any) : router.replace('/(tabs)/tests'))} fullWidth />
      </SafeAreaView>
    );
  }

  if (phase === 'error') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, gap: theme.spacing.md }}>
        <IconCircle name="alert-circle-outline" size={72} backgroundColor={theme.colors.errorSoft} color={theme.colors.error} />
        <Text variant="h3" align="center">
          Something went wrong
        </Text>
        <Text color="secondary" align="center">
          {errorMessage ?? 'We could not evaluate your essay. Check your connection and try again.'}
        </Text>
        <Button label="Try again" onPress={() => { submittingRef.current = false; setErrorMessage(null); setPhase('writing'); }} fullWidth />
      </SafeAreaView>
    );
  }

  if (blockedByLimit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.md, justifyContent: 'center' }}>
        <DailyLimitCard used={limitStatus.used} limit={limitStatus.limit} feature="Writing evaluations" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.md }}>
        <Pressable onPress={handleExit} hitSlop={10}>
          <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
        </Pressable>
        <Text variant="bodyMedium" color={isExpired ? 'error' : 'primary'}>
          {timerLabel}
        </Text>
        <Badge label={prompt.taskType.replace(/_/g, ' ')} tone="brand" />
        <Button label="Submit" size="sm" onPress={handleSubmit} disabled={isEmpty} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <Card style={{ margin: theme.spacing.md }}>
          <Text variant="h3" style={{ marginBottom: theme.spacing.xs }}>
            {prompt.title}
          </Text>
          <Text variant="body" color="secondary" style={{ lineHeight: 22 }}>
            {prompt.promptText}
          </Text>
          {prompt.chartData ? (
            <View style={{ marginTop: theme.spacing.md, alignItems: 'center' }}>
              <WritingChart data={prompt.chartData} />
            </View>
          ) : null}
        </Card>

        <View style={{ paddingHorizontal: theme.spacing.md }}>
          <TextInput
            value={essay}
            onChangeText={setEssay}
            multiline
            textAlignVertical="top"
            placeholder="Start writing your response here..."
            placeholderTextColor={theme.colors.textTertiary}
            style={{
              minHeight: 320,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              padding: theme.spacing.md,
              color: theme.colors.textPrimary,
              fontSize: 15,
              lineHeight: 22,
              backgroundColor: theme.colors.surface,
            }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.xs, marginBottom: theme.spacing.xl }}>
            <Text variant="caption" color={belowMinimum ? 'warning' : 'secondary'}>
              {wordCount} / {prompt.minWords} words minimum
            </Text>
            <Text variant="caption" color="tertiary">
              Autosaved
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
