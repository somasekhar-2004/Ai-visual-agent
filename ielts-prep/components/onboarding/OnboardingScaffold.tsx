import React from 'react';
import { View } from 'react-native';

import { Button, ProgressBar, Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';

export function OnboardingScaffold({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  primaryLabel = 'Continue',
  onPrimary,
  primaryDisabled,
  secondaryLabel,
  onSecondary,
  loading,
}: {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  primaryLabel?: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  loading?: boolean;
}) {
  const theme = useTheme();

  return (
    <Screen>
      <ProgressBar progress={step / totalSteps} />
      <View style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing.lg }}>
        <Text variant="h1">{title}</Text>
        {subtitle ? (
          <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.xs }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={{ flex: 1 }}>{children}</View>
      <View style={{ gap: theme.spacing.sm, paddingTop: theme.spacing.md }}>
        <Button label={primaryLabel} onPress={onPrimary} disabled={primaryDisabled} loading={loading} fullWidth />
        {secondaryLabel ? <Button label={secondaryLabel} onPress={onSecondary} variant="ghost" fullWidth /> : null}
      </View>
    </Screen>
  );
}
