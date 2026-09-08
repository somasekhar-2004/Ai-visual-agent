import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';

// Visualizes a band score (0-9) as a ring. Used for predicted/target band displays.
export function BandRing({
  band,
  maxBand = 9,
  size = 96,
  strokeWidth = 9,
  label,
  color,
}: {
  band: number;
  maxBand?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}) {
  const theme = useTheme();
  const radiusPx = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusPx;
  const progress = Math.max(0, Math.min(1, band / maxBand));
  const dashOffset = circumference * (1 - progress);
  const ringColor = color ?? theme.colors.primary;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusPx}
          stroke={theme.colors.surfaceAlt}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusPx}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text variant="h2">{band.toFixed(1)}</Text>
        {label ? (
          <Text variant="micro" color="tertiary">
            {label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
