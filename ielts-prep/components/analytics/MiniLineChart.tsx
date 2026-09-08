import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';

export function MiniLineChart({ values, height = 100, max = 9 }: { values: number[]; height?: number; max?: number }) {
  const theme = useTheme();
  if (values.length === 0) {
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <Text color="tertiary">Not enough data yet</Text>
      </View>
    );
  }
  const width = Math.max(200, values.length * 40);
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * (width - 16) + 8;
      const y = height - (v / max) * (height - 16) - 8;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline points={points} fill="none" stroke={theme.colors.primary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => {
        const x = (i / Math.max(1, values.length - 1)) * (width - 16) + 8;
        const y = height - (v / max) * (height - 16) - 8;
        return <Circle key={i} cx={x} cy={y} r={4} fill={theme.colors.primary} />;
      })}
    </Svg>
  );
}
