import { Ionicons } from '@expo/vector-icons';
import React, { Fragment, useRef, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';

import { Badge, Button, Card, Text, TextField } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { isAnswerCorrect, TFNG_OPTIONS, usesFreeTextInput, YNNG_OPTIONS } from '@/lib/answerChecking';
import { DEBUG_TOUCH_BOUNDS } from '@/lib/debugFlags';
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
  const { width: screenWidth } = useWindowDimensions();
  const [selected, setSelected] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  // See lib/debugFlags.ts's DEBUG_TOUCH_BOUNDS — Button.tsx's own debug
  // overlay already shows this same number as a tiny corner badge ON the
  // button itself, but it's easy to miss or mis-crop in a screenshot. This
  // measures the SAME real Pressable (the View directly wrapping it here
  // shrinks to its size too, since the parent's `alignItems: 'center'`
  // applies uniformly to all its direct children) and prints it as an
  // ordinary, legible text line right below the button, directly next to
  // the full screen width for an unmissable side-by-side comparison.
  const [checkAnswerWidth, setCheckAnswerWidth] = useState<number | null>(null);

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
          Card.
          Deliberately compact and centred, NOT fullWidth (unlike Next
          question) — a real device report found this exact full-width
          button only responding to taps near its centre, not its full
          visible edge-to-edge span; narrowing it so there's simply much
          less distance between its centre and its own edges removes that
          failure mode regardless of its underlying cause, which earlier
          fixes (hitSlop, then alignSelf alone) didn't resolve on-device.
          Wrapped in its OWN `alignItems: 'center'` View rather than relying
          on `alignSelf: 'center'` on the Button alone — belt-and-suspenders:
          this makes the centring/shrink-to-content behavior depend only on
          this View's own (ordinary, static) layout, not on how a sibling's
          `alignSelf` resolves against a distant ancestor's (the ScrollView
          content container, two levels up) default `alignItems: 'stretch'`
          through Button's own functional `style` prop. `paddingHorizontal:
          32` gives the label more breathing room than Button's own default
          `md`-size padding (20); `minHeight: 48` keeps the touch-target
          height explicit even though Button's own fixed `height: 48` for
          `md` already satisfies it — background (backgroundColor) and the
          press handler (onPress) are both applied by Button to the SAME
          Pressable element, so neither this wrapper nor that style override
          can ever create a mismatch between what's drawn and what's
          tappable; both always describe the one real Pressable. */}
      {!revealed ? (
        <View style={{ alignItems: 'center', marginTop: theme.spacing.md }}>
          <View onLayout={DEBUG_TOUCH_BOUNDS ? (e) => setCheckAnswerWidth(e.nativeEvent.layout.width) : undefined}>
            <Button
              label="Check answer"
              onPress={submit}
              disabled={freeText ? !textAnswer.trim() : !selected}
              style={{ paddingHorizontal: 32, minHeight: 48 }}
            />
          </View>
          {DEBUG_TOUCH_BOUNDS ? (
            <Text variant="micro" color="tertiary" style={{ marginTop: 2 }}>
              DEBUG: Check-answer width {checkAnswerWidth != null ? Math.round(checkAnswerWidth) : '…'}px of screen width {Math.round(screenWidth)}px
            </Text>
          ) : null}
        </View>
      ) : null}
    </Fragment>
  );
}
