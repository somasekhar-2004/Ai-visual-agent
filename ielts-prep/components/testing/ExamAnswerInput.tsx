import React from 'react';
import { Pressable, View } from 'react-native';

import { Text, TextField } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { TFNG_OPTIONS, YNNG_OPTIONS } from '@/lib/answerChecking';
import type { Question } from '@/types/models';

export function ExamAnswerInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string | null;
  onChange: (v: string) => void;
}) {
  const theme = useTheme();
  const options =
    question.options ??
    (question.questionType === 'true_false_not_given' ? TFNG_OPTIONS : question.questionType === 'yes_no_not_given' ? YNNG_OPTIONS : null);

  if (options) {
    return (
      <View style={{ gap: theme.spacing.xs }}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.sm,
                borderWidth: 1.5,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                backgroundColor: selected ? theme.colors.primarySoft : 'transparent',
                borderRadius: theme.radius.md,
                padding: theme.spacing.sm,
              }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 2,
                  borderColor: selected ? theme.colors.primary : theme.colors.textTertiary,
                  backgroundColor: selected ? theme.colors.primary : 'transparent',
                }}
              />
              <Text variant="body">{opt}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return <TextField value={value ?? ''} onChangeText={onChange} placeholder="Type your answer" autoCapitalize="none" />;
}
