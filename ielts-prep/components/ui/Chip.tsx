import React from 'react';
import { Pressable } from 'react-native';

import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.pill,
        backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        variant="caption"
        style={{ color: selected ? theme.colors.onPrimary : theme.colors.textSecondary }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
