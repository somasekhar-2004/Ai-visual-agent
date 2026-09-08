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
import { firstParam } from '@/lib/firstParam';
import { nextFlowHref } from '@/lib/mockFlow';
import { recordDailyActivity, saveReadingAttempt } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

type Params = {
  passageIds?: string;
  passageId?: string;
  mockAttemptId?: string;
  mockTestId?: string;
  stepIndex?: string;
  nextHref?: string;
  durationMinutes?: string;
};

export default function ReadingTestScreen() {
  const theme = useTheme();
  const router = useRouter();
  const raw = useLocalSearchParams<Params>();
  const passageIds = firstParam(raw.passageIds);
  const passageId = firstParam(raw.passageId);
  const mockAttemptId = firstParam(raw.mockAttemptId);
  const mockTestId = firstParam(raw.mockTestId);
  const stepIndex = firstParam(raw.stepIndex);
  const durationMinutes = firstParam(raw.durationMinutes);
  const nextHref =
    mockTestId && mockAttemptId && stepIndex != null
      ? nextFlowHref(mockTestId, mockAttemptId, Number(stepIndex))
      : firstParam(raw.nextHref);
  const userId = useAppStore((s) => s.userId);
  const ieltsType = useAppStore((s) => s.goal?.ieltsType ?? 'academic');

  const passages = useMemo(() => {
    const ids = passageIds ? passageIds.split(',') : passageId ? [passageId] : [];
    const explicit = ids.map((id) => content.readingPassages.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
    if (explicit.length) return explicit;
    // No explicit selection (e.g. the "Reading test" quick-practice entry) —
    // default to one representative passage per section (1-3) of the
    // matching IELTS type, rather than every passage from every mock ever added.
    const byType = content.readingPassages.filter((p) => p.ieltsType === ieltsType);
    const bySection = new Map<number, (typeof byType)[number]>();
    for (const p of byType) {
      if (!bySection.has(p.sectionNumber)) bySection.set(p.sectionNumber, p);
    }
    const deduped = [...bySection.values()].sort((a, b) => a.sectionNumber - b.sectionNumber);
    return deduped.length ? deduped : [content.readingPassages[0]];
  }, [passageIds, passageId, ieltsType]);

  const passageIdSet = useMemo(() => new Set(passages.map((p) => p.id)), [passages]);
  const questions = useMemo(
    () => content.readingQuestions.filter((q) => q.passageId && passageIdSet.has(q.passageId)),
    [passageIdSet]
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [index, setIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(() => Date.now());

  const { label: timerLabel } = useCountdown(Number(durationMinutes ?? 20) * 60, () => !submitted && handleSubmit(true));

  const current = questions[index];
  const currentPassage = passages.find((p) => p.id === current?.passageId) ?? passages[0];
  const passagePosition = passages.findIndex((p) => p.id === currentPassage?.id) + 1;
  const answeredIndices = new Set(questions.map((q, i) => (answers[q.id] ? i : -1)).filter((i) => i >= 0));

  function toggleFlag() {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function handleExit() {
    const confirmed = await confirmAsync('Exit test?', 'Your progress on this test will not be saved. Are you sure you want to exit?', 'Exit');
    if (confirmed) router.back();
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
      passageIds: passages.map((p) => p.id),
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
              {!correct && q.explanation ? (
                <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                  {q.explanation}
                </Text>
              ) : null}
              {!correct && q.strategyNote ? (
                <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>
                  Strategy: {q.strategyNote}
                </Text>
              ) : null}
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
        <Pressable onPress={handleExit} hitSlop={10}>
          <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
        </Pressable>
        <Text variant="bodyMedium">{timerLabel}</Text>
        {passages.length > 1 ? <Badge label={`Passage ${passagePosition} of ${passages.length}`} tone="brand" /> : null}
        <Button label="Submit" size="sm" onPress={() => handleSubmit(false)} />
      </View>

      <View style={{ height: 260, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border }}>
        <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
          {currentPassage ? <HighlightablePassage title={currentPassage.title} body={currentPassage.body} /> : null}
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
