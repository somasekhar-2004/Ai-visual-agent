import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth,
  leftIcon,
  rightIcon,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  // See KNOWN_ISSUES.md — Check-answer-style buttons have a confirmed,
  // still-unresolved bug where edge taps don't register on a real device.
  // hitSlop only ever EXPANDS the registered touch region outward from the
  // Pressable's own measured frame, so it can't make an already-correct hit
  // area worse; kept as a standing mitigation alongside the compact/centred
  // layout workaround in QuestionCard.tsx even though neither has fully
  // resolved the underlying cause.
  const extraHitSlop = { top: 12, bottom: 12, left: 12, right: 12 };

  const heights: Record<Size, number> = { sm: 36, md: 48, lg: 56 };
  const paddingX: Record<Size, number> = { sm: 12, md: 20, lg: 24 };

  const backgrounds: Record<Variant, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.surfaceAlt,
    outline: 'transparent',
    ghost: 'transparent',
    danger: theme.colors.error,
  };

  const textColors: Record<Variant, string> = {
    primary: theme.colors.onPrimary,
    secondary: theme.colors.textPrimary,
    outline: theme.colors.primary,
    ghost: theme.colors.primary,
    danger: theme.colors.onPrimary,
  };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={extraHitSlop}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          height: heights[size],
          paddingHorizontal: paddingX[size],
          backgroundColor: backgrounds[variant],
          borderRadius: theme.radius.md,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: theme.colors.primary,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} />
      ) : (
        <>
          {leftIcon}
          <Text
            variant="button"
            style={{ color: textColors[variant], marginHorizontal: leftIcon || rightIcon ? 8 : 0 }}
          >
            {label}
          </Text>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
