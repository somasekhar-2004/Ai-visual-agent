import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export function IconCircle({
  name,
  color,
  backgroundColor,
  size = 44,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color?: string;
  backgroundColor?: string;
  size?: number;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: backgroundColor ?? theme.colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={name} size={size * 0.5} color={color ?? theme.colors.primary} />
    </View>
  );
}
