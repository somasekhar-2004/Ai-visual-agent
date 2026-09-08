import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';

/** Renders passage text as tappable word "chips" so students can highlight
 * key terms while reading — a lightweight stand-in for text selection, which
 * React Native does not expose an API to intercept. */
export function HighlightablePassage({
  title,
  body,
  showTitle = true,
}: {
  title: string;
  body: string;
  showTitle?: boolean;
}) {
  const theme = useTheme();
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const paragraphs = body.split(/\n\n+/);

  function toggle(key: string) {
    setHighlighted((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <View>
      {showTitle ? (
        <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>
          {title}
        </Text>
      ) : null}
      {paragraphs.map((para, pIndex) => (
        <View key={pIndex} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.sm }}>
          {para.split(/(\s+)/).map((token, tIndex) => {
            const key = `${pIndex}-${tIndex}`;
            if (/^\s+$/.test(token)) return <Text key={key}>{token}</Text>;
            const isHighlighted = highlighted.has(key);
            return (
              <Pressable key={key} onPress={() => toggle(key)}>
                <Text
                  variant="body"
                  style={{
                    backgroundColor: isHighlighted ? '#FFE58A' : 'transparent',
                    color: isHighlighted ? '#3A2E00' : theme.colors.textPrimary,
                  }}
                >
                  {token}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
