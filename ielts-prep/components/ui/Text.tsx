import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import type { TypographyVariant } from '@/constants/typography';

type Color = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'success' | 'warning' | 'error' | 'brand';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: Color;
  align?: 'left' | 'center' | 'right';
};

const colorMap: Record<Color, (c: ReturnType<typeof useTheme>['colors']) => string> = {
  primary: (c) => c.textPrimary,
  secondary: (c) => c.textSecondary,
  tertiary: (c) => c.textTertiary,
  inverse: (c) => c.textInverse,
  success: (c) => c.success,
  warning: (c) => c.warning,
  error: (c) => c.error,
  brand: (c) => c.primary,
};

export function Text({ variant = 'body', color = 'primary', align, style, ...rest }: TextProps) {
  const theme = useTheme();
  const variantStyle = theme.typography[variant];

  return (
    <RNText
      style={[
        {
          fontFamily: theme.typography.fontFamily,
          color: colorMap[color](theme.colors),
          textAlign: align,
        },
        variantStyle,
        style,
      ]}
      {...rest}
    />
  );
}
