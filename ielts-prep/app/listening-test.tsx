import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExamAnswerInput } from '@/components/testing/ExamAnswerInput';
import { QuestionNavigator } from '@/components/testing/QuestionNavigator';
import { TranscriptAudioPlayer } from '@/components/testing/TranscriptAudioPlayer';
import { Badge, Button, Card, IconCircle, Screen, Text } from '@/components/ui';
import { useCountdown } from '@/hooks/useCountdown';
import { useTheme } from '@/hooks/useTheme';
import { isAnswerCorrect } from '@/lib/answerChecking';
import { rawScoreToBand } from '@/lib/bandScore';
import { confirmAsync } from '@/lib/confirm';
import { content } from '@/lib/content';
import { firstParam } from '@/lib/firstParam';
import { nextFlowHref } from '@/lib/mockFlow';
import { recordDailyActivity, saveListeningAttempt } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

type Params = { trackIds?: string; mockAttemptId?: string; mockTestId?: string; stepIndex?: string; nextHref?: string; durationMinutes?: string };

export default function ListeningTestScreen() {
  const theme = useTheme();
  const router = useRouter();
  const raw = useLocalSearchParams<Params>();
  const trackIds = firstParam(raw.trackIds);
  const mockAttemptId = firstParam(raw.mockAttemptId);
  const mockTestId = firstParam(raw.mockTestId);
  const stepIndex = firstParam(raw.stepIndex);
  const durationMinutes = firstParam(raw.durationMinutes);
  const nextHref =
    mockTestId && mockAttemptId && stepIndex != null
      ? nextFlowHref(mockTestId, mockAttemptId, Number(stepIndex))
      : firstParam(raw.nextHref);
  const userId = useAppStore((s) => s.userId);

  const tracks = useMemo(() => {
    if (trackIds) {
      const ids = trackIds.split(',');
      return content.listeningTracks.filter((t) => ids.includes(t.id));
    }
    // No explicit selection (e.g. the "Listening test" quick-practice entry) —
    // default to one representative track per section (1-4), taken in content
    // order, rather than every track from every mock ever added.
    const bySection = new Map<number, (typeof content.listeningTracks)[number]>();
    for (const t of content.listeningTracks) {
      if (!bySection.has(t.sectionNumber)) bySection.set(t.sectionNumber, t);
    }
    return [...bySection.values()].sort((a, b) => a.sectionNumber - b.sectionNumber);
  }, [trackIds]);

  const questions = useMemo(
    () => content.listeningQuestions.filter((q) => tracks.some((t) => t.id === q.listeningTrackId)),
    [tracks]
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [index, setIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const { label: timerLabel } = useCountdown(Number(durationMinutes ?? 30) * 60, () => !submitted && handleSubmit(true));

  const current = questions[index];
  const currentTrack = tracks.find((t) => t.id === current?.listeningTrackId);
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
    const band = rawScoreToBand('listening', Math.round((rawScore / questions.length) * 40));
    await saveListeningAttempt(userId, {
      mockAttemptId,
      trackIds: tracks.map((t) => t.id),
      rawScore,
      totalQuestions: questions.length,
      band,
      answers,
    });
    await recordDailyActivity(userId, 20);
  }

  if (submitted) {
    const rawScore = questions.filter((q) => isAnswerCorrect(q, answers[q.id] ?? null)).length;
    const band = rawScoreToBand('listening', Math.round((rawScore / questions.length) * 40));

    return (
      <Screen scroll>
        <View style={{ alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
          <IconCircle name="headset" size={72} backgroundColor={theme.colors.primarySoft} color={theme.colors.primary} />
          <Text variant="display">{band.toFixed(1)}</Text>
          <Text color="secondary">Estimated Listening Band</Text>
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

      <View style={{ padding: theme.spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border }}>
        {currentTrack ? (
          <TranscriptAudioPlayer trackId={currentTrack.id} title={currentTrack.title} transcript={currentTrack.transcript} />
        ) : null}
      </View>

      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm }}>
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
