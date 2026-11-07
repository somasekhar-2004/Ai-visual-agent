import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';
import { DEBUG_TOUCH_BOUNDS } from '@/lib/debugFlags';

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
  // See lib/debugFlags.ts — temporary. Counts every touch this Pressable
  // itself actually captures (onPressIn fires on touch-down, before
  // onPress on release), independent of whatever onPress does.
  const [debugTapCount, setDebugTapCount] = useState(0);
  // See lib/debugFlags.ts — temporary. The Pressable's own real measured
  // frame (onLayout), shown on screen so two buttons' reported sizes can be
  // directly compared — this is what the native layer actually believes
  // this view's bounds are, as opposed to how big it merely looks.
  const [debugLayout, setDebugLayout] = useState<{ width: number; height: number } | null>(null);
  // A real device report found Check-answer-style buttons only responding
  // near their centre — not yet root-caused (the two earlier fixes for it
  // didn't resolve it on-device). hitSlop only ever EXPANDS the registered
  // touch region outward from the Pressable's own measured frame; it can't
  // make an already-correct hit area worse, so this ships now as a
  // mitigation regardless of whatever the underlying cause turns out to
  // be — see lib/debugFlags.ts's overlay for continued diagnosis if this
  // alone doesn't fully fix it.
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
      onPressIn={DEBUG_TOUCH_BOUNDS ? () => setDebugTapCount((c) => c + 1) : undefined}
      onLayout={DEBUG_TOUCH_BOUNDS ? (e) => setDebugLayout({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height }) : undefined}
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
        // See lib/debugFlags.ts — TEMPORARY. Overrides the border with a
        // bright, unmistakable outline drawn on this Pressable's own box —
        // by construction (same element, same style resolution) this
        // CANNOT mismatch its real touch bounds, unlike a separately
        // measured/positioned overlay would.
        DEBUG_TOUCH_BOUNDS ? { borderWidth: 3, borderColor: '#FF00FF', borderStyle: 'dashed' as const } : null,
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
      {DEBUG_TOUCH_BOUNDS ? (
        <>
          {/* Corner markers — small squares sitting right on each corner of
              this Pressable's own box (children of it, so trivially
              positioned relative to its real bounds, no separate
              measurement needed). Aim taps directly at these. */}
          {([
            { top: -5, left: -5 },
            { top: -5, right: -5 },
            { bottom: -5, left: -5 },
            { bottom: -5, right: -5 },
          ] as const).map((corner, i) => (
            <View
              key={i}
              pointerEvents="none"
              style={[
                { position: 'absolute', width: 10, height: 10, backgroundColor: '#FF00FF', borderRadius: 2 },
                corner,
              ]}
            />
          ))}
          {/* Live tap counter — increments on every touch this Pressable
              itself captures (onPressIn), regardless of what onPress does.
              Tap near an edge/corner: if this number does NOT increase,
              the touch was not captured here at all. */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: -14,
              right: 8,
              backgroundColor: '#FF00FF',
              borderRadius: 8,
              paddingHorizontal: 6,
              paddingVertical: 1,
            }}
          >
            <Text variant="micro" style={{ color: '#fff' }}>
              taps: {debugTapCount}
            </Text>
          </View>
          {/* Real measured frame (onLayout) — compare this number between
              Check-answer and Next question directly: if one reports a
              much smaller width/height than it visually looks, that's a
              genuine sizing bug, not a native touch-dispatch quirk. */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: -14,
              left: 8,
              backgroundColor: '#FF00FF',
              borderRadius: 8,
              paddingHorizontal: 6,
              paddingVertical: 1,
            }}
          >
            <Text variant="micro" style={{ color: '#fff' }}>
              {debugLayout ? `${Math.round(debugLayout.width)}×${Math.round(debugLayout.height)}` : '…'}
            </Text>
          </View>
        </>
      ) : null}
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
