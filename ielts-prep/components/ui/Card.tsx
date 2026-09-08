import React from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

type CardProps = ViewProps & {
  onPress?: () => void;
  elevation?: 'sm' | 'md' | 'lg' | 'none';
  variant?: 'surface' | 'soft';
};

export function Card({ onPress, elevation = 'sm', variant = 'surface', style, children, ...rest }: CardProps) {
  const theme = useTheme();

  const baseStyle = [
    {
      backgroundColor: variant === 'surface' ? theme.colors.surface : theme.colors.surfaceAlt,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      borderWidth: variant === 'surface' ? 1 : 0,
      borderColor: theme.colors.border,
    },
    theme.shadows[elevation],
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...baseStyle, pressed && { opacity: 0.85 }]}
        {...(rest as object)}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={baseStyle} {...rest}>
      {children}
    </View>
  );
}
