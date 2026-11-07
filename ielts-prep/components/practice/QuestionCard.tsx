import { Ionicons } from '@expo/vector-icons';
import React, { Fragment, useRef, useState } from 'react';
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

  // Synchronous re-entrancy guard — `revealed` becoming true already
  // unmounts the Check-answer button (see the Fragment below), but that
  // only takes effect once React re-renders; two taps landing close enough
  // together to both be processed before that re-render would otherwise
  // both call onAnswered, consuming two question attempts (and, upstream,
  // two daily-limit slots) for the single answer actually given.
  const submittingRef = useRef(false);

  function submit() {
    if (submittingRef.current) return;
    const answer = freeText ? textAnswer.trim() : selected;
    if (!answer) return;
    submittingRef.current = true;
    const correct = isAnswerCorrect(question, answer);
    setRevealed(true);
    onAnswered(answer, correct);
  }

  const finalAnswer = freeText ? textAnswer.trim() : selected;
  const correct = revealed && finalAnswer ? isAnswerCorrect(question, finalAnswer) : null;

  return (
    <Fragment>
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

      {revealed ? (
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
      ) : null}
      </Card>
      {/* Deliberately a sibling of the Card, not nested inside it — matching
          practice-session.tsx's "Next question"/"Finish" button, which is
          also a sibling of this whole component rather than inside the
          Card. Nested inside the Card's own padding, this button's visible
          fill still looked full-width, but structurally it sat behind an
          extra layer of padding/inset that "Next question" never had,
          which was the suspected (not device-confirmed) cause of the
          reported "Check answer only responds near the centre" bug. */}
      {!revealed ? (
        <Button label="Check answer" onPress={submit} disabled={freeText ? !textAnswer.trim() : !selected} fullWidth style={{ marginTop: theme.spacing.md }} />
      ) : null}
    </Fragment>
  );
}
