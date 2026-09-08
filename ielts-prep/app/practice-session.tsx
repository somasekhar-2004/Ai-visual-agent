import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { useShallow } from 'zustand/react/shallow';

import { CollapsiblePanel } from '@/components/practice/CollapsiblePanel';
import { QuestionCard } from '@/components/practice/QuestionCard';
import { HighlightablePassage } from '@/components/testing/HighlightablePassage';
import { TranscriptAudioPlayer } from '@/components/testing/TranscriptAudioPlayer';
import { Button, Chip, DailyLimitCard, IconCircle, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { content } from '@/lib/content';
import { checkDailyLimit, FREE_DAILY_PRACTICE_QUESTIONS, practiceQuestionsUsedToday } from '@/lib/entitlements';
import { groupQuestions } from '@/lib/practiceGrouping';
import {
  getBookmarks,
  getQuestionAttempts,
  listQuestions,
  recordDailyActivity,
  recordQuestionAttempt,
  toggleQuestionBookmark,
} from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import type { Difficulty, QuestionType, SkillKey } from '@/types/models';

type Params = { skill?: SkillKey; mode?: 'incorrect' | 'bookmarked'; questionType?: QuestionType };

export default function PracticeSessionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { skill, mode, questionType } = useLocalSearchParams<Params>();
  const { userId, isPremium } = useAppStore(useShallow((s) => ({ userId: s.userId, isPremium: s.subscription?.plan !== 'free' })));

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
    let list = listQuestions({ skill, questionType, difficulty: difficulty === 'all' ? undefined : difficulty });
    if (mode === 'incorrect') {
      const incorrectIds = new Set(attemptsQuery.data?.filter((a) => !a.isCorrect).map((a) => a.questionId));
      list = list.filter((q) => incorrectIds.has(q.id));
    } else if (mode === 'bookmarked') {
      const bookmarkedIds = new Set(bookmarksQuery.data?.map((b) => b.questionId));
      list = list.filter((q) => bookmarkedIds.has(q.id));
    }
    return list;
  }, [skill, mode, questionType, difficulty, attemptsQuery.data, bookmarksQuery.data]);

  const current = questions[index];
  const bookmarkedIds = new Set(bookmarksQuery.data?.map((b) => b.questionId));
  const limitStatus = checkDailyLimit(practiceQuestionsUsedToday(attemptsQuery.data ?? []), FREE_DAILY_PRACTICE_QUESTIONS, isPremium);
  // Once already-attempted-today reaches the free cap, block starting a NEW
  // session — but never cut off a session already in progress mid-question.
  const blockedByLimit = index === 0 && results.length === 0 && !limitStatus.allowed;

  const groupByQuestionId = useMemo(() => {
    const map = new Map<string, ReturnType<typeof groupQuestions>[number]>();
    for (const group of groupQuestions(questions)) {
      for (const q of group.questions) map.set(q.id, group);
    }
    return map;
  }, [questions]);

  const currentGroup = current ? groupByQuestionId.get(current.id) : undefined;
  const passage = currentGroup?.passageId ? content.readingPassages.find((p) => p.id === currentGroup.passageId) : undefined;
  const track = currentGroup?.listeningTrackId ? content.listeningTracks.find((t) => t.id === currentGroup.listeningTrackId) : undefined;
  const positionInGroup = currentGroup ? currentGroup.questions.findIndex((q) => q.id === current.id) + 1 : 0;

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

  if (blockedByLimit) {
    return (
      <Screen>
        <ScreenHeader title="Practice" showBack />
        <View style={{ marginTop: theme.spacing.xl }}>
          <DailyLimitCard used={limitStatus.used} limit={limitStatus.limit} feature="Practice questions" />
        </View>
      </Screen>
    );
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

      {passage ? (
        <CollapsiblePanel
          title={passage.title}
          subtitle={`Question ${positionInGroup} of ${currentGroup!.questions.length} for this passage`}
          icon="book-outline"
        >
          <HighlightablePassage title={passage.title} body={passage.body} showTitle={false} />
        </CollapsiblePanel>
      ) : null}

      {track ? (
        <CollapsiblePanel
          title={track.title}
          subtitle={`Question ${positionInGroup} of ${currentGroup!.questions.length} for this section`}
          icon="headset-outline"
          maxHeight={140}
        >
          <TranscriptAudioPlayer trackId={track.id} title={track.title} transcript={track.transcript} showTitle={false} />
        </CollapsiblePanel>
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
