import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export function ProgressBar({
  progress,
  color,
  height = 8,
  trackColor,
}: {
  progress: number; // 0-1
  color?: string;
  height?: number;
  trackColor?: string;
}) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View
      style={{
        height,
        borderRadius: theme.radius.pill,
        backgroundColor: trackColor ?? theme.colors.surfaceAlt,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${clamped * 100}%`,
          borderRadius: theme.radius.pill,
          backgroundColor: color ?? theme.colors.primary,
        }}
      />
    </View>
  );
}
