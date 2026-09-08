import React from 'react';
import { Pressable, ScrollView } from 'react-native';

import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';

export function QuestionNavigator({
  count,
  currentIndex,
  answeredIndices,
  flaggedIndices,
  onSelect,
}: {
  count: number;
  currentIndex: number;
  answeredIndices: Set<number>;
  flaggedIndices: Set<number>;
  onSelect: (index: number) => void;
}) {
  const theme = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
      {Array.from({ length: count }).map((_, i) => {
        const isCurrent = i === currentIndex;
        const isAnswered = answeredIndices.has(i);
        const isFlagged = flaggedIndices.has(i);
        return (
          <Pressable
            key={i}
            onPress={() => onSelect(i)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: isCurrent ? 2 : 1,
              borderColor: isFlagged ? theme.colors.warning : isCurrent ? theme.colors.primary : theme.colors.border,
              backgroundColor: isAnswered ? theme.colors.primarySoft : 'transparent',
            }}
          >
            <Text variant="caption" color={isCurrent ? 'brand' : isAnswered ? 'primary' : 'tertiary'}>
              {i + 1}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
