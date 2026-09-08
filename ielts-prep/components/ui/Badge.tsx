import React from 'react';
import { View } from 'react-native';

import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';

type Tone = 'neutral' | 'success' | 'warning' | 'error' | 'brand';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const theme = useTheme();

  const tones: Record<Tone, { bg: string; fg: string }> = {
    neutral: { bg: theme.colors.surfaceAlt, fg: theme.colors.textSecondary },
    success: { bg: theme.colors.successSoft, fg: theme.colors.success },
    warning: { bg: theme.colors.warningSoft, fg: theme.colors.warning },
    error: { bg: theme.colors.errorSoft, fg: theme.colors.error },
    brand: { bg: theme.colors.primarySoft, fg: theme.colors.primary },
  };

  const t = tones[tone];

  return (
    <View
      style={{
        backgroundColor: t.bg,
        borderRadius: theme.radius.pill,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        alignSelf: 'flex-start',
      }}
    >
      <Text variant="micro" style={{ color: t.fg }}>
        {label}
      </Text>
    </View>
  );
}
