import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import type { StudyPlanItem } from '@/types/models';

export function StudyPlanItemRow({ item, onToggle, onPress }: { item: StudyPlanItem; onToggle: () => void; onPress: () => void }) {
  const theme = useTheme();
  const color = theme.skillColors[item.skill];

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
      }}
    >
      <Pressable
        onPress={onToggle}
        hitSlop={10}
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: item.isCompleted ? theme.colors.success : color,
          backgroundColor: item.isCompleted ? theme.colors.success : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {item.isCompleted ? <Ionicons name="checkmark" size={14} color={theme.colors.onPrimary} /> : null}
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium" style={item.isCompleted ? { textDecorationLine: 'line-through', opacity: 0.5 } : undefined}>
          {item.title}
        </Text>
        {item.description ? (
          <Text variant="caption" color="secondary">
            {item.description}
          </Text>
        ) : null}
      </View>
      <Text variant="caption" color="tertiary">
        {item.durationMinutes} min
      </Text>
      <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
    </Pressable>
  );
}
