import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Badge, Button, Card, Text, TextField } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { isAnswerCorrect, TFNG_OPTIONS, usesFreeTextInput, YNNG_OPTIONS } from '@/lib/answerChecking';
import type { Question } from '@/types/models';

export function QuestionCard({
  question,
  onAnswered,
  isBookmarked,
  onToggleBookmark,
}: {
  question: Question;
  onAnswered: (userAnswer: string | null, isCorrect: boolean) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}) {
  const theme = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);

  const options =
    question.options ??
    (question.questionType === 'true_false_not_given' ? TFNG_OPTIONS : question.questionType === 'yes_no_not_given' ? YNNG_OPTIONS : null);

  const freeText = usesFreeTextInput(question) && !options;

  function submit() {
    const answer = freeText ? textAnswer.trim() : selected;
    if (!answer) return;
    const correct = isAnswerCorrect(question, answer);
    setRevealed(true);
    onAnswered(answer, correct);
  }

  const finalAnswer = freeText ? textAnswer.trim() : selected;
  const correct = revealed && finalAnswer ? isAnswerCorrect(question, finalAnswer) : null;

  return (
    <Card style={{ gap: theme.spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Badge label={question.questionType.replace(/_/g, ' ')} tone="neutral" />
        <Pressable onPress={onToggleBookmark} hitSlop={10}>
          <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={theme.colors.primary} />
        </Pressable>
      </View>

      <Text variant="bodyLg">{question.prompt}</Text>

      {options ? (
        <View style={{ gap: theme.spacing.xs }}>
          {options.map((opt) => {
            const isSelected = selected === opt;
            const showCorrect = revealed && isAnswerCorrect(question, opt);
            const showWrong = revealed && isSelected && !showCorrect;
            return (
              <Pressable
                key={opt}
                disabled={revealed}
                onPress={() => setSelected(opt)}
                style={{
                  borderWidth: 1.5,
                  borderColor: showCorrect
                    ? theme.colors.success
                    : showWrong
                      ? theme.colors.error
                      : isSelected
                        ? theme.colors.primary
                        : theme.colors.border,
                  backgroundColor: showCorrect ? theme.colors.successSoft : showWrong ? theme.colors.errorSoft : 'transparent',
                  borderRadius: theme.radius.md,
                  padding: theme.spacing.sm,
                }}
              >
                <Text variant="body">{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <TextField
          value={textAnswer}
          onChangeText={setTextAnswer}
          editable={!revealed}
          placeholder="Type your answer"
          autoCapitalize="none"
        />
      )}

      {!revealed ? (
        <Button label="Check answer" onPress={submit} disabled={freeText ? !textAnswer.trim() : !selected} fullWidth />
      ) : (
        <View
          style={{
            backgroundColor: correct ? theme.colors.successSoft : theme.colors.errorSoft,
            borderRadius: theme.radius.md,
            padding: theme.spacing.md,
            gap: theme.spacing.xs,
          }}
        >
          <Text variant="bodyMedium" color={correct ? 'success' : 'error'}>
            {correct ? 'Correct!' : `Not quite — correct answer: ${Array.isArray(question.correctAnswer) ? question.correctAnswer[0] : question.correctAnswer}`}
          </Text>
          {question.explanation ? (
            <Text variant="body" color="secondary">
              {question.explanation}
            </Text>
          ) : null}
          {question.strategyNote ? (
            <Text variant="caption" color="tertiary">
              Strategy: {question.strategyNote}
            </Text>
          ) : null}
        </View>
      )}
    </Card>
  );
}
