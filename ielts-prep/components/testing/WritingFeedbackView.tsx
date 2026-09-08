import React from 'react';
import { View } from 'react-native';

import { Button, Card, DemoAiBadge, ProgressBar, Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import type { WritingEvaluation, WritingEvaluationResult } from '@/services/ai';

const CRITERIA: { key: keyof WritingEvaluation; label: string }[] = [
  { key: 'taskAchievement', label: 'Task Achievement' },
  { key: 'coherenceCohesion', label: 'Coherence & Cohesion' },
  { key: 'lexicalResource', label: 'Lexical Resource' },
  { key: 'grammaticalRange', label: 'Grammatical Range & Accuracy' },
];

function ListSection({ title, items, tone }: { title: string; items: string[]; tone: 'success' | 'warning' | 'brand' }) {
  const theme = useTheme();
  const color = tone === 'success' ? theme.colors.success : tone === 'warning' ? theme.colors.warning : theme.colors.primary;
  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <Text variant="bodyMedium" style={{ marginBottom: theme.spacing.xs }}>
        {title}
      </Text>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginTop: 7 }} />
          <Text variant="body" color="secondary" style={{ flex: 1 }}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function WritingFeedbackView({ evaluation, onDone }: { evaluation: WritingEvaluationResult; onDone: () => void }) {
  const theme = useTheme();
  const nextBand = Math.min(9, evaluation.overallBand + 0.5);

  return (
    <Screen scroll>
      <View style={{ alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
        <Text variant="caption" color="tertiary">
          AI Evaluation — Estimated Band
        </Text>
        <Text variant="display">{evaluation.overallBand.toFixed(1)}</Text>
        <DemoAiBadge source={evaluation.aiSource} />
      </View>

      <Card style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.sm }}>
        {CRITERIA.map((c) => (
          <View key={c.key}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text variant="caption" color="secondary">
                {c.label}
              </Text>
              <Text variant="caption" color="secondary">
                {(evaluation[c.key] as number).toFixed(1)}
              </Text>
            </View>
            <ProgressBar progress={(evaluation[c.key] as number) / 9} />
          </View>
        ))}
      </Card>

      <ListSection title="Strengths" items={evaluation.strengths} tone="success" />
      <ListSection title="Areas to improve" items={evaluation.weaknesses} tone="warning" />
      <ListSection title="Suggested next steps" items={evaluation.suggestions} tone="brand" />

      <Card style={{ marginBottom: theme.spacing.md }}>
        <Text variant="bodyMedium" style={{ marginBottom: theme.spacing.xs }}>
          Improved example
        </Text>
        <Text variant="body" color="secondary" style={{ fontStyle: 'italic' }}>
          &ldquo;{evaluation.improvedExample}&rdquo;
        </Text>
      </Card>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="bodyMedium" style={{ marginBottom: theme.spacing.xs }}>
          How to reach Band {nextBand.toFixed(1)}
        </Text>
        <Text variant="body" color="secondary">
          Focus on the lowest-scoring criterion above first — small, consistent improvements there tend to move your overall band fastest. Aim to apply at least one suggestion above in your next writing task before moving on.
        </Text>
      </Card>

      <Text variant="caption" color="tertiary" style={{ marginBottom: theme.spacing.lg }}>
        This score is an AI-generated estimate for practice purposes and is not an official IELTS result.
      </Text>

      <Button label="Done" onPress={onDone} fullWidth style={{ marginBottom: theme.spacing.huge }} />
    </Screen>
  );
}
