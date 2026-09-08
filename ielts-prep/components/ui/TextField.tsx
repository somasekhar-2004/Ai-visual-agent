import React, { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
};

export function TextField({ label, error, hint, style, onFocus, onBlur, ...rest }: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: theme.spacing.xxs }}>
      {label ? (
        <Text variant="bodyMedium" color="secondary">
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={theme.colors.textTertiary}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          {
            height: 52,
            borderRadius: theme.radius.md,
            borderWidth: 1.5,
            borderColor: error ? theme.colors.error : focused ? theme.colors.primary : theme.colors.border,
            paddingHorizontal: theme.spacing.md,
            backgroundColor: theme.colors.surface,
            color: theme.colors.textPrimary,
            fontSize: theme.typography.body.fontSize,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text variant="caption" color="error">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="tertiary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
