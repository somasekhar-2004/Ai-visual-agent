import React, { useState } from 'react';

import { Badge, Card, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import type { VocabularyWord } from '@/types/models';

export function Flashcard({ word }: { word: VocabularyWord }) {
  const theme = useTheme();
  const [flipped, setFlipped] = useState(false);

  return (
    <Card onPress={() => setFlipped((f) => !f)} elevation="md" style={{ minHeight: 280, justifyContent: 'center', gap: theme.spacing.sm }}>
      {!flipped ? (
        <>
          <Badge label={word.difficulty} tone="neutral" />
          <Text variant="display" align="center">
            {word.word}
          </Text>
          {word.pronunciationIpa ? (
            <Text variant="body" color="secondary" align="center">
              {word.pronunciationIpa}
            </Text>
          ) : null}
          <Text variant="caption" color="tertiary" align="center" style={{ marginTop: theme.spacing.md }}>
            Tap to reveal definition
          </Text>
        </>
      ) : (
        <>
          <Text variant="bodyLg" style={{ marginBottom: theme.spacing.sm }}>
            {word.definition}
          </Text>
          <Text variant="body" color="secondary" style={{ fontStyle: 'italic', marginBottom: theme.spacing.sm }}>
            &ldquo;{word.exampleSentence}&rdquo;
          </Text>
          {word.synonyms.length ? (
            <Text variant="caption" color="tertiary">
              Synonyms: {word.synonyms.join(', ')}
            </Text>
          ) : null}
          {word.collocations.length ? (
            <Text variant="caption" color="tertiary">
              Collocations: {word.collocations.join(', ')}
            </Text>
          ) : null}
        </>
      )}
    </Card>
  );
}
