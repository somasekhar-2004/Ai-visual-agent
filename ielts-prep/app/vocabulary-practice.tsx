import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Flashcard } from '@/components/vocabulary/Flashcard';
import { Button, Card, Chip, IconCircle, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { content } from '@/lib/content';
import { listVocabulary, reviewVocabWord } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function VocabularyPracticeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const userId = useAppStore((s) => s.userId);

  const [mode, setMode] = useState<'flashcards' | 'quiz'>('flashcards');
  const words = useMemo(() => listVocabulary(topic), [topic]);

  const [index, setIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  const current = words[index];

  function buildQuizOptions(wordIndex: number) {
    const correct = words[wordIndex].word;
    const pool = shuffle(content.vocabularyWords.filter((w) => w.word !== correct)).slice(0, 3).map((w) => w.word);
    setQuizOptions(shuffle([correct, ...pool]));
    setSelected(null);
  }

  function startQuiz() {
    setMode('quiz');
    setIndex(0);
    setQuizScore(0);
    buildQuizOptions(0);
  }

  async function handleFlashcardAction(remembered: boolean) {
    if (userId && current) {
      await reviewVocabWord(userId, current.id, remembered);
      queryClient.invalidateQueries({ queryKey: ['user-vocabulary', userId] });
    }
    if (index + 1 < words.length) setIndex((i) => i + 1);
    else setIndex(words.length);
  }

  function handleQuizAnswer(option: string) {
    if (selected) return;
    setSelected(option);
    if (option === current.word) setQuizScore((s) => s + 1);
    setTimeout(() => {
      if (index + 1 < words.length) {
        setIndex((i) => i + 1);
        buildQuizOptions(index + 1);
      } else {
        setIndex(words.length);
      }
    }, 700);
  }

  if (index >= words.length) {
    return (
      <Screen>
        <ScreenHeader title={topic} showBack />
        <View style={{ alignItems: 'center', gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
          <IconCircle name="ribbon-outline" size={72} backgroundColor={theme.colors.successSoft} color={theme.colors.success} />
          <Text variant="h2">{mode === 'quiz' ? `${quizScore}/${words.length} correct` : 'Deck complete'}</Text>
          {mode === 'flashcards' ? (
            <Button label="Start quiz" onPress={startQuiz} fullWidth />
          ) : (
            <Button label="Review flashcards again" onPress={() => { setMode('flashcards'); setIndex(0); }} fullWidth />
          )}
          <Button label="Back to vocabulary" variant="ghost" onPress={() => router.back()} fullWidth />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title={topic} showBack />
      <View style={{ flexDirection: 'row', gap: theme.spacing.xs, marginBottom: theme.spacing.md }}>
        <Chip label="Flashcards" selected={mode === 'flashcards'} onPress={() => { setMode('flashcards'); setIndex(0); }} />
        <Chip label="Quiz" selected={mode === 'quiz'} onPress={startQuiz} />
      </View>
      <ProgressBar progress={index / words.length} />
      <Text variant="caption" color="tertiary" style={{ marginTop: theme.spacing.xs, marginBottom: theme.spacing.md }}>
        {index + 1} / {words.length}
      </Text>

      {mode === 'flashcards' ? (
        <>
          <Flashcard key={current.id} word={current} />
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
            <Button label="Didn't know" variant="secondary" onPress={() => handleFlashcardAction(false)} style={{ flex: 1 }} />
            <Button label="Knew it" onPress={() => handleFlashcardAction(true)} style={{ flex: 1 }} />
          </View>
        </>
      ) : (
        <Card style={{ gap: theme.spacing.md }}>
          <Text variant="bodyLg">{current.definition}</Text>
          {quizOptions.map((opt) => {
            const isSelected = selected === opt;
            const isCorrect = opt === current.word;
            const showState = Boolean(selected);
            return (
              <Button
                key={opt}
                label={opt}
                onPress={() => handleQuizAnswer(opt)}
                variant={showState ? (isCorrect ? 'primary' : isSelected ? 'danger' : 'secondary') : 'secondary'}
                fullWidth
              />
            );
          })}
        </Card>
      )}
    </Screen>
  );
}
