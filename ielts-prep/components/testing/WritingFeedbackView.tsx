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

      {evaluation.repeatedWords.length ? (
        <Card style={{ marginBottom: theme.spacing.md }}>
          <Text variant="bodyMedium" style={{ marginBottom: theme.spacing.xs }}>
            Repeated words
          </Text>
          <Text variant="body" color="secondary">
            You used these words often enough that a synonym swap would help Lexical Resource: {evaluation.repeatedWords.join(', ')}.
          </Text>
        </Card>
      ) : null}

      {evaluation.sentenceIssues.length ? (
        <Card style={{ marginBottom: theme.spacing.md, gap: theme.spacing.sm }}>
          <Text variant="bodyMedium">Sentence-level issues</Text>
          {evaluation.sentenceIssues.map((issue, i) => (
            <View key={i} style={{ gap: 2 }}>
              <Text variant="body" style={{ fontStyle: 'italic' }} color="secondary">
                &ldquo;{issue.original}&rdquo;
              </Text>
              <Text variant="caption" color="warning">
                {issue.issue}
              </Text>
              <Text variant="caption" color="secondary">
                Fix: {issue.suggestion}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}

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
          {evaluation.nextBandAction}
        </Text>
      </Card>

      <Text variant="caption" color="tertiary" style={{ marginBottom: theme.spacing.lg }}>
        This score is an AI-generated estimate for practice purposes and is not an official IELTS result.
      </Text>

      <Button label="Done" onPress={onDone} fullWidth style={{ marginBottom: theme.spacing.huge }} />
    </Screen>
  );
}
