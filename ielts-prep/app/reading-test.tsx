import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExamAnswerInput } from '@/components/testing/ExamAnswerInput';
import { HighlightablePassage } from '@/components/testing/HighlightablePassage';
import { QuestionNavigator } from '@/components/testing/QuestionNavigator';
import { Badge, Button, Card, IconCircle, Screen, Text, TextField } from '@/components/ui';
import { useCountdown } from '@/hooks/useCountdown';
import { useTheme } from '@/hooks/useTheme';
import { isAnswerCorrect } from '@/lib/answerChecking';
import { rawScoreToBand } from '@/lib/bandScore';
import { confirmAsync } from '@/lib/confirm';
import { content } from '@/lib/content';
import { recordDailyActivity, saveReadingAttempt } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

type Params = { passageId?: string; mockAttemptId?: string; nextHref?: string; durationMinutes?: string };

export default function ReadingTestScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { passageId, mockAttemptId, nextHref, durationMinutes } = useLocalSearchParams<Params>();
  const userId = useAppStore((s) => s.userId);
  const ieltsType = useAppStore((s) => s.goal?.ieltsType ?? 'academic');

  const passage = useMemo(
    () => content.readingPassages.find((p) => p.id === passageId) ?? content.readingPassages.find((p) => p.ieltsType === ieltsType) ?? content.readingPassages[0],
    [passageId, ieltsType]
  );
  const questions = useMemo(() => content.readingQuestions.filter((q) => q.passageId === passage.id), [passage]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [index, setIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(Date.now());

  const { label: timerLabel } = useCountdown(Number(durationMinutes ?? 20) * 60, () => !submitted && handleSubmit(true));

  const current = questions[index];
  const answeredIndices = new Set(questions.map((q, i) => (answers[q.id] ? i : -1)).filter((i) => i >= 0));

  function toggleFlag() {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function handleSubmit(auto = false) {
    const unanswered = questions.length - answeredIndices.size;
    if (!auto && unanswered > 0) {
      const confirmed = await confirmAsync(
        `${unanswered} unanswered question${unanswered > 1 ? 's' : ''}`,
        'Are you sure you want to submit? Unanswered questions will be marked incorrect.',
        'Submit anyway'
      );
      if (!confirmed) return;
    }
    finalizeSubmit();
  }

  async function finalizeSubmit() {
    setSubmitted(true);
    if (!userId) return;
    const rawScore = questions.filter((q) => isAnswerCorrect(q, answers[q.id] ?? null)).length;
    const scale = ieltsType === 'academic' ? 'reading_academic' : 'reading_general';
    const band = rawScoreToBand(scale, Math.round((rawScore / questions.length) * 40));
    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
    await saveReadingAttempt(userId, {
      mockAttemptId,
      ieltsType,
      passageIds: [passage.id],
      rawScore,
      totalQuestions: questions.length,
      band,
      timeSpentSeconds,
      answers,
    });
    await recordDailyActivity(userId, 20);
  }

  if (submitted) {
    const rawScore = questions.filter((q) => isAnswerCorrect(q, answers[q.id] ?? null)).length;
    const scale = ieltsType === 'academic' ? 'reading_academic' : 'reading_general';
    const band = rawScoreToBand(scale, Math.round((rawScore / questions.length) * 40));

    return (
      <Screen scroll>
        <View style={{ alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
          <IconCircle name="book" size={72} backgroundColor={theme.colors.primarySoft} color={theme.colors.primary} />
          <Text variant="display">{band.toFixed(1)}</Text>
          <Text color="secondary">Estimated Reading Band</Text>
          <Badge label={`${rawScore}/${questions.length} correct`} tone="brand" />
        </View>
        <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>
          Review
        </Text>
        {questions.map((q, i) => {
          const correct = isAnswerCorrect(q, answers[q.id] ?? null);
          return (
            <Card key={q.id} style={{ marginBottom: theme.spacing.sm }}>
              <Text variant="caption" color="tertiary">
                Question {i + 1}
              </Text>
              <Text variant="body" style={{ marginVertical: 4 }}>
                {q.prompt}
              </Text>
              <Text variant="caption" color={correct ? 'success' : 'error'}>
                Your answer: {answers[q.id] ?? '(none)'} {correct ? '✓' : `— correct: ${Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer}`}
              </Text>
            </Card>
          );
        })}
        <Text variant="caption" color="tertiary" style={{ marginBottom: theme.spacing.lg }}>
          This is an AI-generated practice estimate, not an official IELTS result.
        </Text>
        <Button
          label="Continue"
          fullWidth
          onPress={() => (nextHref ? router.replace(nextHref as any) : router.replace('/(tabs)/tests'))}
        />
      </Screen>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.md }}>
        <Text variant="bodyMedium">{timerLabel}</Text>
        <Button label="Submit" size="sm" onPress={() => handleSubmit(false)} />
      </View>

      <View style={{ height: 260, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border }}>
        <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
          <HighlightablePassage title={passage.title} body={passage.body} />
        </ScrollView>
      </View>

      <Pressable onPress={() => setShowNotes((s) => !s)} style={{ padding: theme.spacing.sm, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
        <Ionicons name="document-text-outline" size={16} color={theme.colors.primary} />
        <Text variant="caption" color="brand">
          {showNotes ? 'Hide notes' : 'Notes'}
        </Text>
      </Pressable>
      {showNotes ? (
        <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.sm }}>
          <TextField value={notes} onChangeText={setNotes} placeholder="Jot down anything useful..." multiline />
        </View>
      ) : null}

      <View style={{ paddingHorizontal: theme.spacing.md }}>
        <QuestionNavigator
          count={questions.length}
          currentIndex={index}
          answeredIndices={answeredIndices}
          flaggedIndices={flagged}
          onSelect={setIndex}
        />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.md }}>
        <Card style={{ gap: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="caption" color="tertiary">
              Question {index + 1} of {questions.length}
            </Text>
            <Pressable onPress={toggleFlag} style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
              <Ionicons name={flagged.has(index) ? 'flag' : 'flag-outline'} size={16} color={theme.colors.warning} />
              <Text variant="caption" color="warning">
                Flag
              </Text>
            </Pressable>
          </View>
          <Text variant="bodyLg">{current.prompt}</Text>
          <ExamAnswerInput question={current} value={answers[current.id] ?? null} onChange={(v) => setAnswers((a) => ({ ...a, [current.id]: v }))} />
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <Button label="Previous" variant="secondary" onPress={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} style={{ flex: 1 }} />
            <Button
              label="Next"
              onPress={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
              disabled={index === questions.length - 1}
              style={{ flex: 1 }}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
