import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { QuestionCard } from '@/components/practice/QuestionCard';
import { Button, Chip, IconCircle, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import {
  getBookmarks,
  getQuestionAttempts,
  listQuestions,
  recordDailyActivity,
  recordQuestionAttempt,
  toggleQuestionBookmark,
} from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import type { Difficulty, SkillKey } from '@/types/models';

type Params = { skill?: SkillKey; mode?: 'incorrect' | 'bookmarked' };

export default function PracticeSessionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { skill, mode } = useLocalSearchParams<Params>();
  const userId = useAppStore((s) => s.userId);

  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

  const attemptsQuery = useQuery({
    queryKey: ['question-attempts', userId],
    queryFn: () => getQuestionAttempts(userId!),
    enabled: Boolean(userId),
  });
  const bookmarksQuery = useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: () => getBookmarks(userId!),
    enabled: Boolean(userId),
  });

  const questions = useMemo(() => {
    let list = listQuestions({ skill, difficulty: difficulty === 'all' ? undefined : difficulty });
    if (mode === 'incorrect') {
      const incorrectIds = new Set(attemptsQuery.data?.filter((a) => !a.isCorrect).map((a) => a.questionId));
      list = list.filter((q) => incorrectIds.has(q.id));
    } else if (mode === 'bookmarked') {
      const bookmarkedIds = new Set(bookmarksQuery.data?.map((b) => b.questionId));
      list = list.filter((q) => bookmarkedIds.has(q.id));
    }
    return list;
  }, [skill, mode, difficulty, attemptsQuery.data, bookmarksQuery.data]);

  const current = questions[index];
  const bookmarkedIds = new Set(bookmarksQuery.data?.map((b) => b.questionId));

  async function handleAnswered(_answer: string | null, isCorrect: boolean) {
    if (!userId || !current) return;
    await recordQuestionAttempt(userId, current.id, _answer, isCorrect, current.estimatedTimeSeconds);
    setResults((r) => [...r, isCorrect]);
  }

  async function handleToggleBookmark() {
    if (!userId || !current) return;
    await toggleQuestionBookmark(userId, current.id);
    queryClient.invalidateQueries({ queryKey: ['bookmarks', userId] });
  }

  async function handleNext() {
    if (index + 1 >= questions.length) {
      if (userId) await recordDailyActivity(userId, results.length * 5);
      setIndex(index + 1); // moves past the end to show the summary screen
      return;
    }
    setIndex((i) => i + 1);
  }

  if (questions.length === 0) {
    return (
      <Screen>
        <ScreenHeader title="Practice" showBack />
        <View style={{ alignItems: 'center', marginTop: theme.spacing.xxxl, gap: theme.spacing.md }}>
          <IconCircle name="checkmark-done-circle-outline" size={72} />
          <Text variant="h3" align="center">
            No questions match this filter yet
          </Text>
          <Text color="secondary" align="center">
            Try a different difficulty, or check back after more practice.
          </Text>
          <Button label="Back" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  if (index >= questions.length) {
    const correctCount = results.filter(Boolean).length;
    return (
      <Screen>
        <ScreenHeader title="Session complete" showBack />
        <View style={{ alignItems: 'center', gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
          <IconCircle name="ribbon-outline" size={80} backgroundColor={theme.colors.successSoft} color={theme.colors.success} />
          <Text variant="h1">
            {correctCount}/{results.length}
          </Text>
          <Text color="secondary">questions correct this session</Text>
          <Button label="Practice again" onPress={() => { setIndex(0); setResults([]); }} fullWidth />
          <Button label="Back to Practice" variant="ghost" onPress={() => router.back()} fullWidth />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Practice" showBack />
      <ProgressBar progress={index / questions.length} />
      <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing.xs, marginBottom: theme.spacing.md }}>
        Question {index + 1} of {questions.length}
      </Text>

      {!mode ? (
        <View style={{ flexDirection: 'row', gap: theme.spacing.xs, marginBottom: theme.spacing.md, flexWrap: 'wrap' }}>
          {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
            <Chip key={d} label={d} selected={difficulty === d} onPress={() => { setDifficulty(d); setIndex(0); setResults([]); }} />
          ))}
        </View>
      ) : null}

      <QuestionCard
        key={current.id}
        question={current}
        onAnswered={handleAnswered}
        isBookmarked={bookmarkedIds.has(current.id)}
        onToggleBookmark={handleToggleBookmark}
      />

      {results.length > index ? (
        <Button label={index + 1 === questions.length ? 'Finish' : 'Next question'} onPress={handleNext} fullWidth style={{ marginTop: theme.spacing.md }} />
      ) : null}
    </Screen>
  );
}
