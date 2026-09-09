import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useQuery } from '@tanstack/react-query';

import { WritingFeedbackView } from '@/components/testing/WritingFeedbackView';
import { WritingChart } from '@/components/writing/WritingChart';
import { Badge, Button, Card, DailyLimitCard, Text } from '@/components/ui';
import { useCountdown } from '@/hooks/useCountdown';
import { useTheme } from '@/hooks/useTheme';
import { content } from '@/lib/content';
import { confirmAsync } from '@/lib/confirm';
import { activityUsedToday, checkDailyLimit, FREE_DAILY_WRITING_EVALS } from '@/lib/entitlements';
import { firstParam } from '@/lib/firstParam';
import { nextFlowHref } from '@/lib/mockFlow';
import { countWords } from '@/lib/textAnalysis';
import { evaluateWriting, getAiProviderName, type WritingEvaluationResult } from '@/services/ai';
import { getTestHistory, saveWritingFeedback, submitWriting } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
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
  const { userId, ieltsType, isPremium } = useAppStore(useShallow((s) => ({
    userId: s.userId,
    ieltsType: s.goal?.ieltsType ?? 'academic',
    isPremium: s.subscription?.plan !== 'free',
  })));
  // Only enforce the free daily limit for standalone practice — a writing
  // task that's part of an already-unlocked mock attempt must not be
  // blocked mid-mock.
  const isStandalone = !mockAttemptId;
  const historyQuery = useQuery({
    queryKey: ['test-history', userId],
    queryFn: () => getTestHistory(userId!),
    enabled: Boolean(userId) && isStandalone,
  });
  const limitStatus = checkDailyLimit(activityUsedToday(historyQuery.data ?? [], 'writing'), FREE_DAILY_WRITING_EVALS, isPremium);
  const blockedByLimit = isStandalone && !limitStatus.allowed;

  const prompt = useMemo(
    () => content.writingPrompts.find((p) => p.id === promptId) ?? content.writingPrompts.find((p) => p.ieltsType === ieltsType && p.taskType === 'task2') ?? content.writingPrompts[0],
    [promptId, ieltsType]
  );
  const draftKey = `ielts-prep/writing-draft/${prompt.id}`;

  const [essay, setEssay] = useState('');
  const [startTime] = useState(() => Date.now());
  const [phase, setPhase] = useState<'writing' | 'evaluating' | 'result'>('writing');
  const [evaluation, setEvaluation] = useState<WritingEvaluationResult | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(draftKey).then((saved) => {
      if (saved) setEssay(saved);
    });
  }, [draftKey]);

  useEffect(() => {
    AsyncStorage.setItem(draftKey, essay).catch(() => {});
  }, [essay, draftKey]);

  const wordCount = countWords(essay);
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
    if (!userId) return;
    setPhase('evaluating');
    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
    const submission = await submitWriting(userId, {
      mockAttemptId,
      promptId: prompt.id,
      taskType: prompt.taskType,
      essayText: essay,
      wordCount,
      timeSpentSeconds,
    });
    const result = await evaluateWriting({
      taskType: prompt.taskType,
      promptText: prompt.promptText,
      essayText: essay,
      wordCount,
      minWords: prompt.minWords,
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
    setPhase('result');
  }

  const { label: timerLabel, isExpired } = useCountdown(prompt.timeLimitMinutes * 60, () => phase === 'writing' && doSubmit());

  if (phase === 'evaluating') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
        <Text variant="h3">Evaluating your writing...</Text>
        <Text color="secondary">Checking Task Achievement, Coherence, Vocabulary, and Grammar.</Text>
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
        <Button label="Submit" size="sm" onPress={handleSubmit} />
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
