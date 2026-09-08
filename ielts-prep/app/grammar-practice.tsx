import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Badge, Button, Card, IconCircle, ProgressBar, Screen, ScreenHeader, Text, TextField } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { listGrammarQuestions, recordGrammarAttempt, weakGrammarTopics, getGrammarQuestionAttempts } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export default function GrammarPracticeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { topic, mode } = useLocalSearchParams<{ topic?: string; mode?: string }>();
  const userId = useAppStore((s) => s.userId);

  const attemptsQuery = useQuery({
    queryKey: ['grammar-attempts', userId],
    queryFn: () => getGrammarQuestionAttempts(userId!),
    enabled: Boolean(userId),
  });

  const questions = useMemo(() => {
    if (mode === 'weak' && attemptsQuery.data) {
      const weakTopics = new Set(weakGrammarTopics(attemptsQuery.data));
      return listGrammarQuestions().filter((q) => weakTopics.has(q.topic));
    }
    return listGrammarQuestions(topic ? { topic } : {});
  }, [topic, mode, attemptsQuery.data]);

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const current = questions[index];
  const isCorrect = current ? normalize(answer) === normalize(current.correctAnswer) : false;

  async function handleSubmit() {
    if (!current || !answer.trim()) return;
    setSubmitted(true);
    const correct = normalize(answer) === normalize(current.correctAnswer);
    if (correct) setScore((s) => s + 1);
    if (userId) {
      await recordGrammarAttempt(userId, current.id, answer, correct);
      queryClient.invalidateQueries({ queryKey: ['grammar-attempts', userId] });
    }
  }

  function handleNext() {
    setSubmitted(false);
    setAnswer('');
    setIndex((i) => i + 1);
  }

  if (mode === 'weak' && attemptsQuery.isLoading) {
    return (
      <Screen>
        <ScreenHeader title="Weak-topic review" showBack />
        <Text color="secondary">Loading...</Text>
      </Screen>
    );
  }

  if (questions.length === 0) {
    return (
      <Screen>
        <ScreenHeader title={topic ?? 'Grammar practice'} showBack />
        <View style={{ alignItems: 'center', gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
          <IconCircle name="checkmark-done-circle-outline" size={64} backgroundColor={theme.colors.successSoft} color={theme.colors.success} />
          <Text variant="h3" align="center">
            {mode === 'weak' ? 'No weak topics right now' : 'No questions available'}
          </Text>
          <Text color="secondary" align="center">
            {mode === 'weak'
              ? 'Answer a few more grammar questions across different topics, and this screen will highlight any you should review.'
              : 'Try a different topic from the Grammar hub.'}
          </Text>
          <Button label="Back to Grammar" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  if (index >= questions.length) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <Screen>
        <ScreenHeader title={topic ?? 'Grammar practice'} showBack />
        <View style={{ alignItems: 'center', gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
          <IconCircle name="ribbon-outline" size={72} backgroundColor={theme.colors.successSoft} color={theme.colors.success} />
          <Text variant="h2">
            {score}/{questions.length} correct
          </Text>
          <Badge label={`${pct}%`} tone={pct >= 70 ? 'success' : pct >= 40 ? 'warning' : 'error'} />
          <Button
            label="Practice again"
            onPress={() => {
              setIndex(0);
              setScore(0);
              setSubmitted(false);
              setAnswer('');
            }}
            fullWidth
          />
          <Button label="Back to Grammar" variant="ghost" onPress={() => router.back()} fullWidth />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader title={topic ?? (mode === 'weak' ? 'Weak-topic review' : 'Grammar practice')} showBack />
      <ProgressBar progress={index / questions.length} />
      <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing.xs, marginBottom: theme.spacing.md }}>
        Question {index + 1} of {questions.length}
      </Text>

      <Card style={{ gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Badge label={current.topic} tone="brand" />
          <Badge label={current.difficulty} tone="neutral" />
        </View>
        <Text variant="bodyLg">{current.prompt}</Text>

        {current.options ? (
          <View style={{ gap: theme.spacing.xs }}>
            {current.options.map((opt) => {
              const selected = answer === opt;
              const showState = submitted;
              const optCorrect = normalize(opt) === normalize(current.correctAnswer);
              return (
                <Pressable
                  key={opt}
                  onPress={() => !submitted && setAnswer(opt)}
                  style={{
                    borderWidth: 1.5,
                    borderRadius: theme.radius.md,
                    padding: theme.spacing.sm,
                    borderColor: showState
                      ? optCorrect
                        ? theme.colors.success
                        : selected
                          ? theme.colors.error
                          : theme.colors.border
                      : selected
                        ? theme.colors.primary
                        : theme.colors.border,
                    backgroundColor: showState && optCorrect ? theme.colors.successSoft : selected && !showState ? theme.colors.primarySoft : 'transparent',
                  }}
                >
                  <Text variant="body">{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <TextField
            value={answer}
            onChangeText={setAnswer}
            placeholder={current.questionType === 'error_correction' ? 'Write the corrected sentence' : 'Type your answer'}
            editable={!submitted}
            multiline={current.questionType === 'error_correction'}
          />
        )}

        {submitted ? (
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name={isCorrect ? 'checkmark-circle' : 'close-circle'} size={18} color={isCorrect ? theme.colors.success : theme.colors.error} />
              <Text variant="bodyMedium" color={isCorrect ? 'success' : 'error'}>
                {isCorrect ? 'Correct' : `Correct answer: ${current.correctAnswer}`}
              </Text>
            </View>
            <Text variant="body" color="secondary">
              {current.explanation}
            </Text>
          </View>
        ) : null}

        <Button
          label={submitted ? (index + 1 < questions.length ? 'Next question' : 'See results') : 'Check answer'}
          onPress={submitted ? handleNext : handleSubmit}
          disabled={!submitted && !answer.trim()}
          fullWidth
        />
      </Card>
    </Screen>
  );
}
