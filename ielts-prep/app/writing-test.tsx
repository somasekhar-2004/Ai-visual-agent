import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WritingFeedbackView } from '@/components/testing/WritingFeedbackView';
import { Badge, Button, Card, Text } from '@/components/ui';
import { useCountdown } from '@/hooks/useCountdown';
import { useTheme } from '@/hooks/useTheme';
import { content } from '@/lib/content';
import { confirmAsync } from '@/lib/confirm';
import { countWords } from '@/lib/textAnalysis';
import { evaluateWriting, type WritingEvaluation } from '@/services/ai';
import { saveWritingFeedback, submitWriting } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

type Params = { promptId?: string; mockAttemptId?: string; nextHref?: string };

export default function WritingTestScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { promptId, mockAttemptId, nextHref } = useLocalSearchParams<Params>();
  const userId = useAppStore((s) => s.userId);
  const ieltsType = useAppStore((s) => s.goal?.ieltsType ?? 'academic');

  const prompt = useMemo(
    () => content.writingPrompts.find((p) => p.id === promptId) ?? content.writingPrompts.find((p) => p.ieltsType === ieltsType && p.taskType === 'task2') ?? content.writingPrompts[0],
    [promptId, ieltsType]
  );
  const draftKey = `ielts-prep/writing-draft/${prompt.id}`;

  const [essay, setEssay] = useState('');
  const [startTime] = useState(() => Date.now());
  const [phase, setPhase] = useState<'writing' | 'evaluating' | 'result'>('writing');
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(draftKey).then((saved) => {
      if (saved) setEssay(saved);
    });
  }, [draftKey]);

  useEffect(() => {
    AsyncStorage.setItem(draftKey, essay).catch(() => {});
  }, [essay, draftKey]);

  const { label: timerLabel, isExpired } = useCountdown(prompt.timeLimitMinutes * 60);
  const wordCount = countWords(essay);
  const belowMinimum = wordCount < prompt.minWords;

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
      aiModel: 'mock',
    });
    await AsyncStorage.removeItem(draftKey);
    setPhase('result');
  }

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.md }}>
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
